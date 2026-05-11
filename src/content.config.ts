import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/work" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    image: z.string().optional(),
    url: z.string().optional(),
    label: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/projects" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    status: z.enum(["front-burner", "back-burner", "retired"]),
    tech: z.array(z.string()).default([]),
    url: z.string().optional(),
    image: z.string().optional(),
    demoURL: z.string().optional(),
    repoURL: z.string().optional(),
    waitlistURL: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { posts, work, projects };
