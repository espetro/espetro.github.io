import task from "tasuku";
import { $ } from "zx";

$.quiet = true;
$.nothrow = true;

await task.group(
  (runner) => [
    runner("TypeScript", async () => {
      const result = await $`pnpm astro check`;
      if (result.exitCode !== 0) throw new Error("Type errors found");
    }),
    runner("Lint", async () => {
      const result = await $`pnpm lint`;
      if (result.exitCode !== 0) throw new Error("Lint errors found");
    }),
    runner("Format", async () => {
      const result = await $`pnpm format`;
      if (result.exitCode !== 0) throw new Error("Format issues found");
    }),
  ],
  { concurrency: 1, stopOnError: false },
);
