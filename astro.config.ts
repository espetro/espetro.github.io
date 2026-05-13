import "dotenv/config";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import keystatic from "@keystatic/astro";

const isKeystaticEnabled = !!process.env.ENABLE_KEYSTATIC;

// https://astro.build/config
export default defineConfig({
  site: "https://illo.fyi",
  output: "static",
  adapter: isKeystaticEnabled ? node({ mode: "middleware" }) : undefined,
  outDir: "./dist",
  integrations: [
    sitemap(),
    mdx(),
    react(),
    ...(isKeystaticEnabled ? [keystatic()] : []),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ["**/.worktrees/**"],
      },
    },
  },
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
});
