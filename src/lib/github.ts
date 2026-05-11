/**
 * GitHub Server-Side Fetcher
 *
 * IMPORTANT: This module must only be imported in server-side contexts.
 * Never import this in client-side components - it uses GITHUB_TOKEN.
 */

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const CONTRIBUTION_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

export interface Activity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface RecentCommit {
  repo: string;
  lang: string;
  message: string;
  url: string;
}

interface GitHubContributionDay {
  contributionCount: number;
  date: string;
  contributionLevel: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
}

interface GitHubContributionWeek {
  contributionDays: GitHubContributionDay[];
}

interface GitHubContributionCalendar {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
}

interface GitHubContributionsCollection {
  contributionCalendar: GitHubContributionCalendar;
}

interface GitHubUser {
  contributionsCollection: GitHubContributionsCollection;
}

interface GitHubGraphQLResponse {
  data?: {
    user: GitHubUser;
  };
  errors?: Array<{
    message: string;
  }>;
}

/**
 * Map contribution level string to numeric level (0-4)
 */
function mapContributionLevel(
  level: GitHubContributionDay["contributionLevel"]
): Activity["level"] {
  switch (level) {
    case "NONE":
      return 0;
    case "FIRST_QUARTILE":
      return 1;
    case "SECOND_QUARTILE":
      return 2;
    case "THIRD_QUARTILE":
      return 3;
    case "FOURTH_QUARTILE":
      return 4;
    default:
      return 0;
  }
}

/**
 * Cache for GitHub contribution data (in-memory, 1 hour TTL)
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<Activity[]>>();

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch GitHub contributions for a user
 *
 * @param username - GitHub username
 * @returns Array of Activity objects for react-activity-calendar
 *
 * @example
 * const activities = await fetchGitHubContributions("octocat");
 */
export async function fetchGitHubContributions(
  username: string
): Promise<Activity[]> {
  const cached = cache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const token = import.meta.env.GITHUB_TOKEN;

  if (!token) {
    console.error("[GitHub Fetcher] GITHUB_TOKEN is not set");
    return [];
  }

  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: {
          username,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
    });

    if (!response.ok) {
      console.error(
        `[GitHub Fetcher] HTTP error: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const json: GitHubGraphQLResponse = await response.json();

    if (json.errors && json.errors.length > 0) {
      console.error(
        `[GitHub Fetcher] GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`
      );
      return [];
    }

    if (!json.data?.user?.contributionsCollection?.contributionCalendar) {
      console.error("[GitHub Fetcher] No contribution data found");
      return [];
    }

    const { contributionCalendar } = json.data.user.contributionsCollection;

    const activities: Activity[] = contributionCalendar.weeks.flatMap(
      (week) =>
        week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: mapContributionLevel(day.contributionLevel),
        }))
    );

    activities.sort((a, b) => a.date.localeCompare(b.date));

    cache.set(username, { data: activities, timestamp: Date.now() });

    return activities;
  } catch (error) {
    console.error("[GitHub Fetcher] Fetch failed:", error);
    return [];
  }
}

/**
 * Cache for recent commits (in-memory, 30 min TTL)
 */
const commitsCache = new Map<string, CacheEntry<RecentCommit[]>>();
const COMMITS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const COMMITS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      repositories(first: 20, orderBy: { field: PUSHED_AT, direction: DESC }) {
        nodes {
          name
          url
          primaryLanguage {
            name
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 3) {
                  nodes {
                    message
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

interface GitHubCommitsResponse {
  data?: {
    user: {
      repositories: {
        nodes: Array<{
          name: string;
          url: string;
          primaryLanguage: { name: string } | null;
          defaultBranchRef: {
            target: {
              history: {
                nodes: Array<{
                  message: string;
                  url: string;
                }>;
              };
            } | null;
          } | null;
        }>;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

/**
 * Fetch recent commits across user's repositories
 *
 * @param username - GitHub username
 * @returns Array of RecentCommit objects (max 5)
 */
export async function fetchRecentCommits(
  username: string
): Promise<RecentCommit[]> {
  const cached = commitsCache.get(username);
  if (cached && Date.now() - cached.timestamp < COMMITS_CACHE_TTL_MS) {
    return cached.data;
  }

  const token = import.meta.env.GITHUB_TOKEN;

  if (!token) {
    console.error("[GitHub Commits] GITHUB_TOKEN is not set");
    return [];
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: COMMITS_QUERY,
        variables: { username },
      }),
    });

    if (!response.ok) {
      console.error(
        `[GitHub Commits] HTTP error: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const json: GitHubCommitsResponse = await response.json();

    if (json.errors && json.errors.length > 0) {
      console.error(
        `[GitHub Commits] GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`
      );
      return [];
    }

    if (!json.data?.user?.repositories?.nodes) {
      console.error("[GitHub Commits] No repository data found");
      return [];
    }

    const commits: RecentCommit[] = [];

    for (const repo of json.data.user.repositories.nodes) {
      if (!repo.defaultBranchRef?.target?.history?.nodes) continue;

      for (const commit of repo.defaultBranchRef.target.history.nodes) {
        const firstLine = commit.message.split("\n")[0];
        commits.push({
          repo: repo.name,
          lang: repo.primaryLanguage?.name ?? "",
          message: firstLine,
          url: commit.url,
        });

        if (commits.length >= 5) break;
      }
      if (commits.length >= 5) break;
    }

    commitsCache.set(username, { data: commits, timestamp: Date.now() });

    return commits;
  } catch (error) {
    console.error("[GitHub Commits] Fetch failed:", error);
    return [];
  }
}
