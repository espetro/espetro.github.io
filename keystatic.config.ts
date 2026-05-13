import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "github",
    repo: "espetro/espetro.github.io",
  },
  collections: {
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "content/blog/*/index",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({ label: "Date" }),
        description: fields.text({
          label: "Description",
          multiline: true,
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
        }),
        draft: fields.checkbox({
          label: "Draft",
          defaultValue: false,
        }),
        content: fields.mdx({ label: "Content" }),
      },
    }),
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "content/projects/*/index",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({ label: "Date" }),
        description: fields.text({
          label: "Description",
          multiline: true,
        }),
        category: fields.select({
          label: "Category",
          options: [
            { label: "Front Burner", value: "front-burner" },
            { label: "Back Burner", value: "back-burner" },
            { label: "Retired", value: "retired" },
          ],
          defaultValue: "front-burner",
        }),
        tech: fields.array(fields.text({ label: "Tech" }), {
          label: "Tech Stack",
        }),
        tagline: fields.text({ label: "Tagline" }),
        demoURL: fields.url({ label: "Demo URL" }),
        repoURL: fields.url({ label: "Repo URL" }),
        content: fields.mdx({ label: "Content" }),
      },
    }),
    work: collection({
      label: "Work",
      slugField: "title",
      path: "content/work/*/index",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({ label: "Date" }),
        description: fields.text({
          label: "Description",
          multiline: true,
        }),
        image: fields.text({
          label: "Image",
          validation: { isRequired: false },
        }),
        url: fields.url({ label: "URL" }),
        label: fields.text({ label: "Label" }),
        content: fields.mdx({ label: "Content" }),
      },
    }),
  },
});
