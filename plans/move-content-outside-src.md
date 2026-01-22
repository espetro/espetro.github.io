# Moving Content Outside of src in Astro

## Current Configuration Analysis

The current project uses Astro 5.13.9 with content collections configured in `src/content.config.ts`. Each collection is defined using the `glob` loader with a specific `base` path:

```typescript
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});
```

## Can Content Be Moved Outside of src?

**Yes, it is possible to move the content directory outside of `src` to the project root (`$ROOT/content`).**

### How to Do It

The `base` parameter in the `glob` loader determines where Astro looks for content files. To move content from `src/content` to `content` (at the project root), you would need to:

1. Move the physical directories:
   - `src/content/blog` → `content/blog`
   - `src/content/projects` → `content/projects`
   - `src/content/waitlist` → `content/waitlist`

2. Update `src/content.config.ts` to change the base paths:
   ```typescript
   const blog = defineCollection({
     loader: glob({ pattern: '**/*.{md,mdx}', base: "./content/blog" }),
     // ... rest of schema
   });
   
   const projects = defineCollection({
     loader: glob({ pattern: '**/*.{md,mdx}', base: "./content/projects" }),
     // ... rest of schema
   });
   
   const waitlist = defineCollection({
     loader: glob({ pattern: '**/*.{md,mdx}', base: "./content/waitlist" }),
     // ... rest of schema
   });
   ```

3. No changes needed in the pages/components that use the content, as they interact with the collections by name, not by path.

## Benefits of Moving Content to Root

1. **Flatter project structure**: Content is at the same level as other top-level directories like `public` and `src`
2. **Clear separation**: Content is clearly separated from implementation code
3. **Easier content management**: Content editors don't need to navigate into the `src` directory
4. **Better organization**: Follows the pattern of other static site generators that place content at the root

## Potential Considerations

1. **Build tools**: Ensure any build tools or scripts that reference the content directory are updated
2. **Deployment**: Verify that deployment processes don't have hardcoded paths to `src/content`
3. **IDE integration**: Some IDE features might expect content in `src/content`, but this is unlikely to be an issue

## Implementation Steps

1. Create the new `content` directory at the project root
2. Move all content from `src/content` to `content`
3. Update `src/content.config.ts` to use the new base paths
4. Test the build process to ensure everything works correctly
5. Update any documentation or scripts that reference the old content location

## Conclusion

Moving content outside of `src` to `$ROOT/content` is fully supported in Astro through the `base` parameter in the glob loader configuration. This change is straightforward to implement and can provide a cleaner project structure with better separation between content and implementation code.