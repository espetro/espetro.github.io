import type { CollectionEntry } from "astro:content";

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

export const workRowOrder: Record<(typeof workScaleOrder)[number], string[]> = {
  product: [
    "brioso",
    "calca",
    "clar",
    "voce",
    "dits",
    "stash",
    "klk",
    "chezy",
    "me-ai",
    "danzabilidad",
  ],
  tool: [
    "intl-ai",
    "cauce",
    "mcp-sim",
    "just-ai",
    "unplugin-agent-plugins",
    "nira",
    "play-ai",
    "refined",
    "privacy-indicators",
  ],
  model: ["htlm", "kev", "wowplay"],
  experiment: [
    "relay",
    "hackbarna-2025",
    "minimal-ai-paas",
    "ai-summary-telegram",
    "noema-ios",
    "pycourse",
  ],
};

export const sortWorks = (works: CollectionEntry<"works">[]) =>
  [...works].sort((a, b) => {
    const scaleOrder =
      workScaleOrder.indexOf(a.data.scale) -
      workScaleOrder.indexOf(b.data.scale);
    if (scaleOrder !== 0) return scaleOrder;

    const highlightOrder =
      (a.data.highlight?.order ?? Number.MAX_SAFE_INTEGER) -
      (b.data.highlight?.order ?? Number.MAX_SAFE_INTEGER);
    if (highlightOrder !== 0) return highlightOrder;

    const order = workRowOrder[a.data.scale];
    const aIndex = order.indexOf(a.id);
    const bIndex = order.indexOf(b.id);
    return (
      (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
      (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
    );
  });
