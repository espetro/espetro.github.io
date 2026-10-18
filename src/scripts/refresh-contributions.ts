import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { GITHUB } from "../consts";

const API_URL = "https://api.github.com";
const EXCLUDED_OWNERS = ["bolojs", "browser-containers", "i-amrita"];
const MAX_MENTIONED_TOTAL = 7;
const MAX_MENTIONED_PER_REPO = 2;

interface SearchResultItem {
  title: string;
  html_url: string;
  url: string;
  updated_at: string;
  repository_url: string;
}

interface RepoDetail {
  stargazers_count: number;
}

interface PullRequest {
  title: string;
  url: string;
  apiUrl: string;
  repo: string;
  repoStars: number;
  state: "merged" | "open";
  credit: "authored" | "co-authored" | "mentioned";
  updatedAt: string;
}

class RateLimitError extends Error {}

function requestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "illo.fyi-refresh-contributions",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

function apiError(response: Response, url: string): Error {
  if (response.status === 403 || response.status === 429) {
    const reset = response.headers.get("x-ratelimit-reset");
    const resetAt = reset
      ? `${reset} (${new Date(Number(reset) * 1000).toISOString()})`
      : "unknown";
    return new RateLimitError(
      `GitHub API rate limit hit (HTTP ${response.status}) for ${url}. x-ratelimit-reset: ${resetAt}`,
    );
  }
  return new Error(`GitHub API request failed: ${response.status} ${url}`);
}

async function ghJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: requestHeaders() });
  if (!response.ok) throw apiError(response, url);
  return (await response.json()) as T;
}

// Authored and co-authored counts as shipped work: the authored query catches
// PRs opened by the user; the mentions query catches PRs opened by others that
// credit the user's work via a Co-authored-by trailer (verified per commit
// below). Anything mentioned but not co-authored is display-only.
function searchUrl(
  kind: "authored" | "mentioned",
  state: "open" | "merged",
): string {
  const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const query = [
    kind === "authored" ? `author:${GITHUB.USER}` : `mentions:${GITHUB.USER}`,
    "type:pr",
    "is:public",
    `is:${state}`,
    `updated:>=${lastYear}`,
    ...[...GITHUB.ORGS, ...EXCLUDED_OWNERS, GITHUB.USER].map(
      (owner) => `-user:${owner}`,
    ),
  ].join(" ");
  const url = new URL(`${API_URL}/search/issues`);
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "updated");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", "30");
  return url.toString();
}

function repoFromUrl(repositoryUrl: string): string {
  const parts = new URL(repositoryUrl).pathname.split("/").filter(Boolean);
  const owner = parts[1];
  const repo = parts[2];
  if (!owner || !repo)
    throw new Error(`Unexpected repository URL: ${repositoryUrl}`);
  return `${owner}/${repo}`;
}

interface CommitMessage {
  commit: { message: string };
}

// A mentions hit is co-authored when one of the PR's commits carries a
// Co-authored-by trailer naming the user. Match the literal email in angle
// brackets — the canonical trailer shape — for each identity the user
// publishes under. The wrapper name and case are irrelevant after the
// message is lower-cased. Search returns issue-style API URLs; swap
// /issues/ for /pulls/ to hit the commits endpoint.
async function isCoAuthored(apiUrl: string): Promise<boolean> {
  const commits = await ghJson<CommitMessage[]>(
    apiUrl.replace("/issues/", "/pulls/") + "/commits",
  );
  const needles = [
    "<26749475+espetro@users.noreply.github.com>",
    "<josocjoq+dev@pm.me>",
    "<oss@illo.fyi>",
  ];
  return commits.some(({ commit }) => {
    const message = commit.message.toLowerCase();
    return needles.some((needle) => message.includes(needle));
  });
}

interface TimelineCrossReference {
  event: string;
  source?: {
    issue?: {
      number: number;
      title: string;
      html_url: string;
      pull_request?: { merged_at: string | null; url: string };
    };
  };
}

// PRs that fix issues the user filed but that never mention the user carry
// real co-authored work the mentions query can't see. Walk the timelines of
// the user's closed issues for cross-referenced merged PRs and let the same
// trailer check decide credit; a hit enters the cache as co-authored even
// though no PR-level @-mention exists.
async function linkedPrsForClosedIssues(): Promise<SearchResultItem[]> {
  const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const query = [
    `author:${GITHUB.USER}`,
    "type:issue",
    "is:public",
    "is:closed",
    `updated:>=${lastYear}`,
    ...[...GITHUB.ORGS, ...EXCLUDED_OWNERS, GITHUB.USER].map(
      (owner) => `-user:${owner}`,
    ),
  ].join(" ");
  const url = new URL(`${API_URL}/search/issues`);
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "updated");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", "50");
  const { items } = await ghJson<{ items: SearchResultItem[] }>(
    url.toString(),
  );

  const found: SearchResultItem[] = [];
  const seen = new Set<string>();
  for (const issue of items) {
    const timeline = await ghJson<TimelineCrossReference[]>(
      `${issue.url}/timeline?per_page=100`,
    );
    for (const event of timeline) {
      const pr = event.source?.issue;
      if (
        event.event !== "cross-referenced" ||
        !pr?.pull_request ||
        !pr.pull_request.merged_at
      )
        continue;
      if (seen.has(pr.html_url)) continue;
      seen.add(pr.html_url);
      found.push({
        title: pr.title,
        html_url: pr.html_url,
        url: pr.pull_request.url,
        updated_at: pr.pull_request.merged_at,
        repository_url: issue.repository_url,
      });
    }
  }
  return found;
}

async function main() {
  const [
    openAuthored,
    mergedAuthored,
    openMentioned,
    mergedMentioned,
    linkedPrs,
  ] = await Promise.all([
    ghJson<{ items: SearchResultItem[] }>(searchUrl("authored", "open")),
    ghJson<{ items: SearchResultItem[] }>(searchUrl("authored", "merged")),
    ghJson<{ items: SearchResultItem[] }>(searchUrl("mentioned", "open")),
    ghJson<{ items: SearchResultItem[] }>(searchUrl("mentioned", "merged")),
    linkedPrsForClosedIssues(),
  ]);

  const unique = new Map<string, PullRequest>();

  for (const [items, state, kind] of [
    [openAuthored.items, "open", "authored"],
    [mergedAuthored.items, "merged", "authored"],
    [openMentioned.items, "open", "mentioned"],
    [mergedMentioned.items, "merged", "mentioned"],
  ] as const) {
    for (const item of items) {
      if (unique.has(item.html_url)) {
        // Keep the strongest credit when a PR appears in both queries.
        if (kind === "authored") unique.get(item.html_url)!.credit = "authored";
        continue;
      }
      unique.set(item.html_url, {
        title: item.title,
        url: item.html_url,
        apiUrl: item.url,
        repo: repoFromUrl(item.repository_url),
        repoStars: 0,
        state,
        credit: kind,
        updatedAt: item.updated_at,
      });
    }
  }

  // Linked-PR pass: co-authored credit via the same trailer check. A PR that
  // also appears above keeps its stronger credit; mentioned-only hits are
  // verified below exactly like the mentions query results.
  for (const item of linkedPrs) {
    if (unique.has(item.html_url)) continue;
    unique.set(item.html_url, {
      title: item.title,
      url: item.html_url,
      apiUrl: item.url,
      repo: repoFromUrl(item.repository_url),
      repoStars: 0,
      state: "merged",
      credit: "mentioned",
      updatedAt: item.updated_at,
    });
  }

  // Verify co-authorship for mentioned-only PRs; those stay "mentioned".
  const mentionedOnly = [...unique.values()].filter(
    (pr) => pr.credit === "mentioned",
  );
  for (const pr of mentionedOnly) {
    if (await isCoAuthored(pr.apiUrl)) {
      pr.credit = "co-authored";
    }
  }

  const prs = [...unique.values()]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf(),
    )
    .slice(0, 30);

  const repoStars = new Map<string, number>();
  for (const repo of new Set(prs.map((pr) => pr.repo))) {
    const url = `${API_URL}/repos/${repo
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
    const detail = await ghJson<RepoDetail>(url);
    repoStars.set(repo, detail.stargazers_count);
  }

  const data = {
    generatedAt: new Date().toISOString(),
    prs: prs.map((pr) => ({ ...pr, repoStars: repoStars.get(pr.repo)! })),
  };
  const outPath = path.resolve(
    import.meta.dirname,
    "../data/contributions.json",
  );
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
  console.log(`Wrote ${data.prs.length} contributions to ${outPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
