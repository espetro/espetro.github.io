import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Joaquin Terrasa",
  DESCRIPTION: "Full-Stack Engineer specialized in multi-agent AI systems",
  EMAIL: "joaquinterrasa@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Joaquin Terrasa - Full-Stack Engineer specializing in multi-agent AI systems",
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
    HREF: "https://twitter.com/espetro",
  },
];
