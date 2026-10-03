import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@consts";
import { publishedWorks, sortWorks } from "@lib/works";

const statusOrder = ["building", "live", "maintained", "archived"] as const;

export const GET: APIRoute = async () => {
  const works = publishedWorks(await getCollection("works"));
  const highlighted = works
    .filter((work) => work.data.highlight)
    .sort(
      (a, b) =>
        (a.data.highlight?.order ?? Number.MAX_SAFE_INTEGER) -
        (b.data.highlight?.order ?? Number.MAX_SAFE_INTEGER),
    );
  const remaining = sortWorks(works.filter((work) => !work.data.highlight));
  const lines = [
    "# About me",
    "",
    "## Who I am",
    "",
    "I'm Quino Terrasa, a Product & Forward-Deployed Engineer. I build and ship agentic AI products end-to-end: from problem discovery and scoping, through implementation, to deployment and iteration alongside the people who actually use the software.",
    "",
    "## What I do",
    "",
    "I take agentic AI products from 0 to 1. That means working close to the customer as a forward-deployed engineer, and also owning product decisions, UX and the technical delivery. My writing and projects sit at the intersection of AI agents, local-first software, developer tooling and UX.",
    "",
    "Some things I've built:",
    "",
    ...highlighted.map(
      (work) =>
        `- **[${work.data.name}](${work.data.primary.url})** — ${work.data.summary}`,
    ),
    "",
    "I also write about AI agent permissions, browser extensions, performance work, ML and emulation internals on my blog.",
    "",
    "## Other work",
    "",
    ...statusOrder.flatMap((status) => {
      const group = remaining.filter((work) => work.data.status === status);
      return group.length === 0
        ? []
        : [
            `### ${status.charAt(0).toUpperCase()}${status.slice(1)}`,
            "",
            ...group.map(
              (work) =>
                `- [${work.data.name}](${work.data.primary.url}) — ${work.data.summary}`,
            ),
            "",
          ];
    }),
    "",
    "## How to work with me",
    "",
    "I'm open to both freelance engagements and full-time roles. If you're building an agentic AI product and need someone who can own the whole loop — talking to users, shaping the product, and shipping the code — reach out.",
    "",
    `- Email: [${SITE.EMAIL}](mailto:${SITE.EMAIL})`,
    `- Newsletter: ${SITE.NEWSLETTER_URL}`,
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
