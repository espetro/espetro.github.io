import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    draft: z.boolean().default(false),
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional().default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    draft: z.boolean().default(false),
    title: z.string(),
    description: z.string(),
    date: z.date(),
    demoURL: z.string().url().optional(),
    repoURL: z.string().url().optional(),
  }),
});

export const collections = { blog, projects };
