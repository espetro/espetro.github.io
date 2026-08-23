export interface Site {
  TITLE: string;
  DESCRIPTION: string;
  EMAIL: string;
  NEWSLETTER_URL: string;
  SHOW_SPEAKING: boolean;
  NUM_POSTS_ON_HOMEPAGE: number;
  NUM_PROJECTS_ON_HOMEPAGE: number;
}

export interface Metadata {
  TITLE: string;
  DESCRIPTION: string;
}

export type Socials = {
  NAME: string;
  HREF: string;
}[];
