import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/consts";
import { currentProjects } from "@/data/landing-data";

export const GET: APIRoute = async (context) => {
  const site = context.site!;

  const posts = (await getCollection("posts"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const lines: string[] = [
    `# ${SITE.TITLE}`,
    "",
    `> ${SITE.DESCRIPTION}`,
    "",
    "## Contact",
    `- Email: ${SITE.EMAIL}`,
    `- Newsletter: ${SITE.NEWSLETTER_URL}`,
    "",
    "## Projects",
    ...currentProjects.map(
      (project) => `- ${project.name}: ${project.description} — ${project.url}`,
    ),
    "",
    "## Blog",
    ...posts.map(
      (post) => `- ${post.data.title}: ${new URL(`/posts/${post.id}/`, site).href}`,
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
