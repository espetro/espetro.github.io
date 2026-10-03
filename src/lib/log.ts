import type { CollectionEntry } from "astro:content";

export interface LogItem {
  id: string;
  kind: "Note" | "Post";
  date: Date;
  title: string;
  description?: string;
  href?: string;
  featured: boolean;
  projectId?: string;
  projectName?: string;
}

export const createLogItems = (
  posts: CollectionEntry<"posts">[],
  notes: CollectionEntry<"notes">[],
  works: CollectionEntry<"works">[],
): LogItem[] => {
  const postsAsItems = posts.map((post): LogItem => {
    const project = works.find((work) => work.id === post.data.project?.id);

    return {
      id: post.id,
      kind: "Post",
      date: post.data.date,
      title: post.data.title,
      href: `/log/${post.id}/`,
      featured: post.data.featured,
      projectId: project?.id,
      projectName: project?.data.name,
    };
  });

  const notesAsItems = notes.map((note): LogItem => {
    const project = works.find((work) => work.id === note.data.project?.id);
    const lines = (note.body ?? "").trim().split("\n");
    const titleIndex = lines.findIndex((line) => /^#{1,6}\s/.test(line));
    const title =
      titleIndex >= 0
        ? lines[titleIndex].replace(/^#{1,6}\s+/, "").trim()
        : note.id.replaceAll("-", " ");
    const description = lines
      .slice(titleIndex >= 0 ? titleIndex + 1 : 0)
      .join(" ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[`*_>#]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return {
      id: note.id,
      kind: "Note",
      date: note.data.date,
      title,
      description,
      href: note.data.link?.url,
      featured: false,
      projectId: project?.id,
      projectName: project?.data.name,
    };
  });

  return [...postsAsItems, ...notesAsItems].sort(
    (a, b) => b.date.valueOf() - a.date.valueOf(),
  );
};
