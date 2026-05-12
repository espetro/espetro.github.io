import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      // project-specific overrides go here
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".astro/**",
      ".worktrees/**",
      "public/**",
    ],
  },
];
