import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import pagefind from "astro-pagefind";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://espetro.github.io",
  output: "static",
  outDir: './dist',
  integrations: [sitemap(), mdx(), react(), pagefind()],
  vite: {
    plugins: [tailwindcss()],
  },
  aliases: {
    "@components": "./src/components",
    "@consts": "./src/consts.ts",
    "@layouts": "./src/layouts",
    "@lib": "./src/lib",
    "@scripts": "./src/scripts",
    "@types": "./src/types.ts",
  },
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
});
