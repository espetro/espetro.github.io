import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { GITHUB } from "../consts";

const API_URL = "https://api.github.com";
const EXCLUDED_OWNERS = ["bolojs", "browser-containers"];

interface SearchResultItem {
  title: string;
  html_url: string;
  updated_at: string;
  repository_url: string;
}

interface RepoDetail {
  stargazers_count: number;
}

interface PullRequest {
  title: string;
  url: string;
  repo: string;
  repoStars: number;
  state: "merged" | "open";
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

function searchUrl(state: "open" | "merged"): string {
  const query = [
    `author:${GITHUB.USER}`,
    "type:pr",
    "is:public",
    `is:${state}`,
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

async function main() {
  const [openResult, mergedResult] = await Promise.all([
    ghJson<{ items: SearchResultItem[] }>(searchUrl("open")),
    ghJson<{ items: SearchResultItem[] }>(searchUrl("merged")),
  ]);

  const unique = new Map<string, PullRequest>();
  for (const [items, state] of [
    [openResult.items, "open"],
    [mergedResult.items, "merged"],
  ] as const) {
    for (const item of items) {
      unique.set(item.html_url, {
        title: item.title,
        url: item.html_url,
        repo: repoFromUrl(item.repository_url),
        repoStars: 0,
        state,
        updatedAt: item.updated_at,
      });
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
