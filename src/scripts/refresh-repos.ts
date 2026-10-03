import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { GITHUB } from "../consts";

const API_URL = "https://api.github.com";
const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const worksDirectory = path.join(repositoryRoot, "content/works");
const cachePath = path.join(repositoryRoot, "src/data/repos.json");

interface GitHubRepo {
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  license: { spdx_id: string | null } | null;
  topics?: string[];
  created_at: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  private: boolean;
}

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  published_at: string | null;
}

interface CachedRepo {
  id: string;
  description: string;
  url: string;
  homepage: string;
  stars: number;
  language: string;
  license: string;
  topics: string[];
  createdAt: string;
  pushedAt: string;
  archived: boolean;
  fork: boolean;
  latestRelease?: { tag: string; url: string; publishedAt: string };
}

interface RepoCache {
  generatedAt: string;
  repos: CachedRepo[];
}

class RateLimitError extends Error {}

function requestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "illo.fyi-refresh-repos",
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

function nextPage(linkHeader: string | null): string | undefined {
  return linkHeader
    ?.split(",")
    .map((link) => link.match(/<([^>]+)>;\s*rel="next"/)?.[1])
    .find((link) => link !== undefined);
}

async function fetchRepos(url: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let pageUrl: string | undefined = url;
  while (pageUrl) {
    const response = await fetch(pageUrl, { headers: requestHeaders() });
    if (!response.ok) throw apiError(response, pageUrl);
    repos.push(...((await response.json()) as GitHubRepo[]));
    pageUrl = nextPage(response.headers.get("link"));
  }
  return repos;
}

async function fetchLatestRelease(
  id: string,
): Promise<CachedRepo["latestRelease"] | null> {
  const url = `${API_URL}/repos/${id
    .split("/")
    .map(encodeURIComponent)
    .join("/")}/releases/latest`;
  const response = await fetch(url, { headers: requestHeaders() });
  if (response.status === 404) return null;
  if (!response.ok) throw apiError(response, url);
  const release = (await response.json()) as GitHubRelease;
  return {
    tag: release.tag_name,
    url: release.html_url,
    publishedAt: release.published_at ?? "",
  };
}

async function readCachedRepos(): Promise<RepoCache> {
  try {
    return JSON.parse(await readFile(cachePath, "utf-8")) as RepoCache;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { generatedAt: "", repos: [] };
    }
    throw error;
  }
}

async function referencedRepos(): Promise<Set<string>> {
  try {
    const directories = await readdir(worksDirectory, { withFileTypes: true });
    const references = new Set<string>();
    for (const directory of directories) {
      if (!directory.isDirectory()) continue;
      const entryPath = path.join(worksDirectory, directory.name, "index.md");
      let source: string;
      try {
        source = await readFile(entryPath, "utf-8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
        throw error;
      }
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const repo = frontmatter?.[1].match(
        /^repo:\s*["']?([^"'#\s]+)["']?\s*$/m,
      )?.[1];
      if (repo) references.add(repo);
    }
    return references;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Set();
    throw error;
  }
}

function toCachedRepo(repo: GitHubRepo): CachedRepo {
  return {
    id: repo.full_name,
    description: repo.description ?? "",
    url: repo.html_url,
    homepage: repo.homepage ?? "",
    stars: repo.stargazers_count,
    language: repo.language ?? "",
    license: repo.license?.spdx_id ?? "",
    topics: repo.topics ?? [],
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
    archived: repo.archived,
    fork: repo.fork,
  };
}

async function main() {
  const sources = [
    `${API_URL}/users/${encodeURIComponent(GITHUB.USER)}/repos?type=owner&sort=updated&per_page=100`,
    ...GITHUB.ORGS.map(
      (org) =>
        `${API_URL}/orgs/${encodeURIComponent(org)}/repos?type=public&sort=updated&per_page=100`,
    ),
  ];
  const publicRepos = new Map<string, GitHubRepo>();
  for (const source of sources) {
    for (const repo of await fetchRepos(source)) {
      if (!repo.private) publicRepos.set(repo.full_name, repo);
    }
  }

  const oldCache = await readCachedRepos();
  const oldRepos = new Map(oldCache.repos.map((repo) => [repo.id, repo]));
  const referenced = await referencedRepos();
  const repos: CachedRepo[] = [];

  for (const repo of [...publicRepos.values()].sort((a, b) =>
    a.full_name.localeCompare(b.full_name),
  )) {
    const cached = oldRepos.get(repo.full_name);
    const next = toCachedRepo(repo);
    if (referenced.has(repo.full_name)) {
      try {
        next.latestRelease =
          (await fetchLatestRelease(repo.full_name)) ?? cached?.latestRelease;
      } catch (error) {
        console.warn(
          `Could not refresh release for ${repo.full_name}; preserving cached value: ${
            error instanceof Error ? error.message : error
          }`,
        );
        next.latestRelease = cached?.latestRelease;
      }
    } else if (cached?.latestRelease) {
      next.latestRelease = cached.latestRelease;
    }
    repos.push(next);
  }

  const cache: RepoCache = { generatedAt: new Date().toISOString(), repos };
  await mkdir(path.dirname(cachePath), { recursive: true });
  await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf-8");
  console.log(`Wrote ${repos.length} public repositories to ${cachePath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
