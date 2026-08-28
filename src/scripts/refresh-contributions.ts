import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SEARCH_URL_ALL =
  "https://api.github.com/search/issues?q=author:espetro+type:pr+is:public+-user:espetro+-user:sigilco+-user:bolojs+-user:browser-containers&sort=updated&order=desc&per_page=7";

const SEARCH_URL_MERGED =
  "https://api.github.com/search/issues?q=author:espetro+type:pr+is:public+is:merged+-user:espetro+-user:sigilco+-user:bolojs+-user:browser-containers&sort=updated&order=desc&per_page=7";

interface SearchResultItem {
  title: string;
  html_url: string;
  state: string;
  comments: number;
  updated_at: string;
  repository_url: string;
  pull_request?: { merged_at: string | null };
}

interface PullDetail {
  additions?: number;
  deletions?: number;
}

interface RepoDetail {
  stargazers_count?: number;
}

interface Contribution {
  title: string;
  url: string;
  repo: string;
  stars: number;
  additions: number;
  deletions: number;
  comments: number;
  state: "merged" | "open";
  updatedAt: string;
}

function rateLimitError(res: Response): Error {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");
  const resetInfo = reset
    ? new Date(Number(reset) * 1000).toISOString()
    : "unknown";
  return new Error(
    `GitHub API rate limit hit (HTTP ${res.status}). Remaining: ${remaining ?? "?"}. Resets at: ${resetInfo}. Aborting.`,
  );
}

async function ghJson<T>(url: string, tolerateFailure = false): Promise<T | null> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "illo.fyi-refresh-contributions",
    },
  });
  if (res.status === 403 || res.status === 429) {
    if (tolerateFailure) return null;
    throw rateLimitError(res);
  }
  if (!res.ok) {
    if (tolerateFailure) return null;
    throw new Error(`GitHub API request failed: ${res.status} ${url}`);
  }
  return (await res.json()) as T;
}

function repoFromUrl(repositoryUrl: string): string {
  // https://api.github.com/repos/{owner}/{repo}
  const parts = repositoryUrl.replace("https://api.github.com/repos/", "");
  // Strip possible subpath
  const [owner, repo] = parts.split("/");
  return `${owner}/${repo}`;
}

async function main() {
  const [searchAll, searchMerged] = await Promise.all([
    ghJson<{ items: SearchResultItem[] }>(SEARCH_URL_ALL),
    ghJson<{ items: SearchResultItem[] }>(SEARCH_URL_MERGED),
  ]);

  if (!searchAll?.items?.length) {
    console.error("No PRs found in search results.");
    process.exit(1);
  }

  const mergedItems = searchMerged?.items ?? [];

  const buildContributions = async (
    items: SearchResultItem[],
  ): Promise<{ contributions: Contribution[]; rateLimited: boolean }> => {
    const contributions: Contribution[] = [];
    let rateLimited = false;

    for (const item of items) {
      const repo = repoFromUrl(item.repository_url);
      const [owner, repoName] = repo.split("/");
      const state: "merged" | "open" =
        item.pull_request?.merged_at != null ? "merged" : "open";

      const number = item.html_url.split("/").pop();
      const [pull, repoDetail] = await Promise.all([
        number
          ? ghJson<PullDetail>(
              `https://api.github.com/repos/${owner}/${repoName}/pulls/${number}`,
              true,
            )
          : Promise.resolve(null),
        ghJson<RepoDetail>(
          `https://api.github.com/repos/${owner}/${repoName}`,
          true,
        ),
      ]);

      if (pull === null || repoDetail === null) rateLimited = true;

      contributions.push({
        title: item.title,
        url: item.html_url,
        repo,
        stars: repoDetail?.stargazers_count ?? 0,
        additions: pull?.additions ?? 0,
        deletions: pull?.deletions ?? 0,
        comments: item.comments,
        state,
        updatedAt: item.updated_at,
      });
    }
    return { contributions, rateLimited };
  };

  const [{ contributions: allContribs, rateLimited: allLimited }, { contributions: mergedContribs, rateLimited: mergedLimited }] =
    await Promise.all([
      buildContributions(searchAll.items),
      buildContributions(mergedItems),
    ]);

  const outPath = path.resolve(import.meta.dirname, "../data/contributions.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(
    outPath,
    `${JSON.stringify({ all: allContribs, merged: mergedContribs }, null, 2)}\n`,
    "utf-8",
  );
  console.log(
    `Wrote ${allContribs.length} all + ${mergedContribs.length} merged contributions to ${outPath}`,
  );
  if (allLimited || mergedLimited) {
    console.warn(
      "Warning: some detail fetches were skipped (rate limit). Additions/deletions/stars may be incomplete.",
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
