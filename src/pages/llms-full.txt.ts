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
  const postById = new Map(posts.map((post) => [post.id, post]));
  const noteById = new Map(notes.map((note) => [note.id, note]));
  const lines = [
    `# ${SITE.TITLE}`,
    "",
    `> ${SITE.DESCRIPTION}`,
    "",
    `Contact: ${SITE.EMAIL}`,
    `Newsletter: ${SITE.NEWSLETTER_URL}`,
    "",
    "## Work",
    "",
  ];

  for (const work of sortWorks(works)) {
    lines.push(
      `### ${work.data.name}`,
      "",
      `Primary: ${work.data.primary.url}`,
      `Status: ${work.data.status}`,
      `Scale: ${work.data.scale}`,
      `Summary: ${work.data.summary}`,
      "",
      work.body?.trim() ?? "",
      "",
    );
  }

  lines.push("## Log", "");

  for (const item of logItems) {
    const url =
      item.kind === "Post"
        ? new URL(`/log/${item.id}/`, site!).href
        : new URL(`/#log-note-${item.id}`, site!).href;
    const body =
      item.kind === "Post"
        ? postById.get(item.id)?.body
        : noteById.get(item.id)?.body;
    const description =
      item.kind === "Post"
        ? postById.get(item.id)?.data.description
        : item.description;

    lines.push(
      `### ${item.title}`,
      "",
      `${item.kind} · ${item.date.toISOString().slice(0, 10)}`,
      `URL: ${url}`,
      ...(item.projectName ? [`Project: ${item.projectName}`] : []),
      ...(description ? [`Description: ${description}`] : []),
      "",
      body?.trim() ?? "",
      "",
    );
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
