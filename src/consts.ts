import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Quino Terrasa",
  DESCRIPTION:
    "Product & Forward-Deployed Engineer — I build and ship agentic AI products end-to-end.",
  EMAIL: "quinoterrasa.alibi366@passfwd.com",
  // TODO: swap to the real Substack URL once the newsletter launches
  NEWSLETTER_URL: "https://illo.fyi/newsletter",
  SHOW_SPEAKING: false,
  NUM_POSTS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION:
    "Quino Terrasa - Product & Forward-Deployed Engineer — I build and ship agentic AI products end-to-end.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of my projects with links to repositories and live demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "LinkedIn",
    HREF: "https://www.linkedin.com/in/quinoterrasa",
  },
  {
    NAME: "GitHub",
    HREF: "https://github.com/espetro",
  },
  {
    NAME: "Twitter",
    HREF: "https://x.com/josocjoq",
  },
];
