import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@consts";
import { createLogItems } from "@lib/log";
import { publishedWorks, sortWorks } from "@lib/works";

export const GET: APIRoute = async ({ site }) => {
  const [allWorks, allPosts, notes] = await Promise.all([
    getCollection("works"),
    getCollection("posts"),
    getCollection("notes"),
  ]);
  const works = publishedWorks(allWorks);
  const posts = allPosts.filter((post) => !post.data.draft);
  const logItems = createLogItems(posts, notes, works);
  const projectLines = sortWorks(works).map(
    (work) =>
      `- [${work.data.name}](${work.data.primary.url}) — ${work.data.summary} (${work.data.status}; ${work.data.scale})`,
  );
  const logLines = logItems.map((entry) => {
    const href =
      entry.kind === "Post"
        ? new URL(`/log/${entry.id}/`, site!).href
        : new URL(`/#log-note-${entry.id}`, site!).href;
    return `- ${entry.date.toISOString().slice(0, 10)} · ${entry.kind}: [${entry.title}](${href})`;
  });

  const lines = [
    `# ${SITE.TITLE}`,
    "",
    `> ${SITE.DESCRIPTION}`,
    "",
    "## Contact",
    `- Email: ${SITE.EMAIL}`,
    `- Newsletter: ${SITE.NEWSLETTER_URL}`,
    "",
    "## Work",
    ...projectLines,
    "",
    "## Log",
    ...logLines,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
