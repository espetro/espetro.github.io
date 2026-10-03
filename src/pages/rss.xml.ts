import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@consts";
import { createLogItems } from "@lib/log";
import { publishedWorks } from "@lib/works";

export async function GET(context: APIContext) {
  const [allWorks, allPosts, notes] = await Promise.all([
    getCollection("works"),
    getCollection("posts"),
    getCollection("notes"),
  ]);
  const works = publishedWorks(allWorks);
  const posts = allPosts.filter((post) => !post.data.draft);
  const notesById = new Map(
    createLogItems([], notes, works).map((item) => [item.id, item]),
  );
  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/log/${post.id}/`,
      content: post.body
        ? `<![CDATA[${post.body.replaceAll("]]>", "]]&gt;")}]]>`
        : undefined,
    })),
    ...notes.map((note) => ({
      title: notesById.get(note.id)?.title ?? note.id,
      description: notesById.get(note.id)?.description ?? "",
      pubDate: note.data.date,
      link: note.data.link?.url ?? `/#log-note-${note.id}`,
      content: note.body
        ? `<![CDATA[${note.body.replaceAll("]]>", "]]&gt;")}]]>`
        : undefined,
    })),
    ...works.map((work) => ({
      title: work.data.name,
      description: work.data.summary,
      pubDate: work.data.since,
      link: work.data.primary.url,
      content: work.body
        ? `<![CDATA[${work.body.replaceAll("]]>", "]]&gt;")}]]>`
        : undefined,
    })),
  ].sort((a, b) => (b.pubDate?.valueOf() ?? 0) - (a.pubDate?.valueOf() ?? 0));

  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: context.site!,
    items,
    customData: `<language>en-us</language>`,
  });
}
