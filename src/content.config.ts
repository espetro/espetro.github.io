import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const works = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./content/works" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      summary: z.string(),
      status: z.enum(["building", "live", "maintained", "archived"]),
      scale: z.enum(["product", "tool", "model", "experiment"]),
      since: z.date().optional(),
      primary: z.object({
        label: z.enum([
          "Visit",
          "Try",
          "Download",
          "Docs",
          "Install",
          "Source",
        ]),
        url: z.url(),
      }),
      repo: reference("repos").optional(),
      labels: z.object({
        surface: z
          .enum([
            "web",
            "desktop",
            "macos",
            "ios",
            "android",
            "mobile",
            "cli",
            "library",
            "extension",
            "api",
            "mcp",
            "bot",
            "model",
            "course",
          ])
          .optional(),
        runtime: z
          .enum([
            "cloud",
            "local-first",
            "on-device",
            "self-host",
            "build-time",
            "in-browser",
          ])
          .optional(),
        source: z.enum(["open", "closed", "private"]).optional(),
      }),
      stack: z.array(z.string()).default([]),
      highlight: z
        .object({ order: z.number().int().positive(), proof: z.string() })
        .optional(),
      cover: image().optional(),
      clip: z.string().optional(),
      links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
      draft: z.boolean().default(false),
    }),
});

const repos = defineCollection({
  loader: file("src/data/repos.json", {
    parser: (text) => JSON.parse(text).repos,
  }),
  schema: z.object({
    id: z.string(),
    description: z.string(),
    url: z.url(),
    homepage: z.string(),
    stars: z.number().int().nonnegative(),
    language: z.string(),
    license: z.string(),
    topics: z.array(z.string()),
    createdAt: z.string(),
    pushedAt: z.string(),
    archived: z.boolean(),
    fork: z.boolean(),
    latestRelease: z
      .object({
        tag: z.string(),
        url: z.url(),
        publishedAt: z.string(),
      })
      .optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content/notes" }),
  schema: z.object({
    date: z.date(),
    project: reference("works").optional(),
    link: z.object({ label: z.string(), url: z.url() }).optional(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().optional(),
    project: reference("works").optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { works, repos, notes, posts };
