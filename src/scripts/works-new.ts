import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { GITHUB } from "../consts";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const cachePath = path.join(repositoryRoot, "src/data/repos.json");
const worksDirectory = path.join(repositoryRoot, "content/works");

interface CachedRepo {
  id: string;
  name: string;
  description: string;
  url: string;
  language: string;
  createdAt: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function cachedRepos(): Promise<CachedRepo[]> {
  try {
    const cache = JSON.parse(await readFile(cachePath, "utf-8")) as {
      repos: CachedRepo[];
    };
    return cache.repos;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function showcasedRepos(): Promise<Set<string>> {
  try {
    const entries = await readdir(worksDirectory, { withFileTypes: true });
    const repos = new Set<string>();
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const source = await readFile(
          path.join(worksDirectory, entry.name, "index.md"),
          "utf-8",
        );
        const repo = source.match(/^repo:\s*["']?([^"'#\s]+)["']?\s*$/m)?.[1];
        if (repo) repos.add(repo);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
    return repos;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Set();
    throw error;
  }
}

async function main() {
  const argument = process.argv[2];
  const repos = await cachedRepos();
  const showcased = await showcasedRepos();

  if (argument === "--list") {
    const unlisted = repos.filter((repo) => !showcased.has(repo.id));
    console.log(unlisted.map((repo) => repo.id).join("\n"));
    return;
  }

  if (!argument) {
    console.error("Usage: pnpm works:new <owner/repo | id> | --list");
    process.exitCode = 1;
    return;
  }

  const cached = repos.find(
    (repo) => repo.id.toLowerCase() === argument.toLowerCase(),
  );
  const suppliedName = argument.split("/").at(-1) ?? argument;
  const id = slugify(cached?.name ?? suppliedName);
  if (!id) throw new Error(`Cannot derive a work id from "${argument}".`);

  const directory = path.join(worksDirectory, id);
  const entryPath = path.join(directory, "index.md");
  try {
    await access(entryPath);
    throw new Error(`Work already exists: ${entryPath}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const repoUrl =
    cached?.url ??
    `https://github.com/${argument.includes("/") ? argument : `${GITHUB.USER}/${id}`}`;
  const repoReference = cached ? `repo: ${JSON.stringify(cached.id)}\n` : "";
  const since = cached?.createdAt
    ? `since: ${cached.createdAt.slice(0, 10)}\n`
    : "";
  const stack = cached?.language
    ? `[${JSON.stringify(cached.language)}]`
    : "[]";
  const sourceLabel = cached ? "open" : "private";
  const name = cached?.name ?? "";
  const summary = cached?.description ?? "";
  const content = `---
name: ${JSON.stringify(name)}
summary: ${JSON.stringify(summary)}
status: building
scale: experiment
${since}primary:
  label: Source
  url: ${JSON.stringify(repoUrl)}
${repoReference}labels:
  source: ${sourceLabel}
stack: ${stack}
draft: true
---
`;

  await mkdir(directory, { recursive: true });
  await writeFile(entryPath, content, "utf-8");
  console.log(`Created ${path.relative(repositoryRoot, entryPath)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
