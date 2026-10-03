import type { CollectionEntry } from "astro:content";
import repos from "../data/repos.json";

export const workScaleOrder = [
  "product",
  "tool",
  "model",
  "experiment",
] as const;

const surfaceLabels = {
  web: "Web",
  desktop: "Desktop",
  macos: "macOS",
  ios: "iOS",
  android: "Android",
  mobile: "Mobile",
  cli: "CLI",
  library: "Library",
  extension: "Extension",
  api: "API",
  mcp: "MCP",
  bot: "Bot",
  model: "Model",
  course: "Course",
} as const;

export const formatSurfaceLabel = (
  surface: keyof typeof surfaceLabels | undefined,
) => (surface ? surfaceLabels[surface] : undefined);

export const publishedWorks = (works: CollectionEntry<"works">[]) =>
  works.filter((work) => !work.data.draft);

const workStatusOrder = ["building", "live", "maintained", "archived"] as const;
const repoCreatedAt = new Map(
  repos.repos.map(({ id, createdAt }) => [id, Date.parse(createdAt)] as const),
);

const workDate = (work: CollectionEntry<"works">) => {
  const date =
    work.data.since?.valueOf() ??
    (work.data.repo ? repoCreatedAt.get(work.data.repo.id) : undefined);

  return date !== undefined && Number.isFinite(date) ? date : undefined;
};

export const sortWorks = (works: CollectionEntry<"works">[]) =>
  [...works].sort((a, b) => {
    const scaleOrder =
      workScaleOrder.indexOf(a.data.scale) -
      workScaleOrder.indexOf(b.data.scale);
    if (scaleOrder !== 0) return scaleOrder;

    const aHighlightOrder = a.data.highlight?.order;
    const bHighlightOrder = b.data.highlight?.order;
    if (aHighlightOrder !== bHighlightOrder) {
      if (aHighlightOrder === undefined) return 1;
      if (bHighlightOrder === undefined) return -1;
      return aHighlightOrder - bHighlightOrder;
    }

    const statusOrder =
      workStatusOrder.indexOf(a.data.status) -
      workStatusOrder.indexOf(b.data.status);
    if (statusOrder !== 0) return statusOrder;

    const aDate = workDate(a);
    const bDate = workDate(b);
    if (aDate !== bDate) {
      if (aDate === undefined) return 1;
      if (bDate === undefined) return -1;
      return bDate - aDate;
    }

    return a.data.name.localeCompare(b.data.name);
  });
