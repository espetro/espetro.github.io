# WaitlistCard Component Redesign Using shadcn Components

## Overview
Replace the current custom [`WaitlistCard.astro`](src/components/WaitlistCard.astro:1) component with a shadcn-based card component that matches the design reference. The new implementation will use shadcn studio's card component (`@ss-components/card-06`) and position the image on the right side.

## Current State Analysis

### Current Component Structure
The current [`WaitlistCard.astro`](src/components/WaitlistCard.astro:1) uses:
- Custom Tailwind styling
- Three-column layout (left sidebar, middle content, right image)
- Manual responsive behavior with `sm:` breakpoints
- Inline status badge and join waitlist link styling

### Current Props Interface
```typescript
interface Props {
  title: string;
  description: string;
  date: Date;
  image?: string;
  waitlistURL?: string;
  status?: string;
  href?: string;
}
```

### Current Waitlist Data
All waitlist items now have images:
- [`i18next-ai.md`](src/content/waitlist/i18next-ai.md:6): `/images/i18next-ai.jpg` (actual file: `i18next-ai.png`)
- [`speaking-ai.md`](src/content/waitlist/speaking-ai.md:6): `/images/speaking-ai.jpg` (actual file: `speaking-ai.jpeg`)

**Note**: There's a file extension mismatch between content references and actual files that needs to be addressed.

## Proposed Design Using shadcn Components

### shadcn Card Component Structure
The `@ss-components/card-06` component from shadcn studio provides:
- Pre-built card layout with proper spacing and styling
- Built-in responsive behavior
- Consistent design system
- Dark mode support out of the box

### Target Layout
```
┌──────────────────────────────────────┬──────────┐
│ Title                                 │          │
│ Description                           │   Image  │
│ Date                                  │          │
│ [Status]  [Join waitlist]             │          │
└──────────────────────────────────────┴──────────┘
```

## Implementation Plan

### Phase 1: Setup and Installation

#### 1.1 Install shadcn Card Component
Execute the following command to install the shadcn card component:
```bash
pnpm dlx shadcn@latest add @ss-components/card-06
```

This will:
- Download the card component from shadcn studio
- Install necessary dependencies
- Set up the component in the project structure

#### 1.2 Configure Components Directory
Ensure shadcn components are stored in:
```
src/components/ui/
```

The shadcn CLI should automatically create this directory structure, but verify that:
- `src/components/ui/` exists
- The card component files are properly organized
- Any utility functions (like `cn` for class merging) are available

#### 1.3 Verify Dependencies
Check that the following are available after installation:
- `clsx` (already in package.json)
- `tailwind-merge` (already in package.json)
- Any new dependencies added by shadcn

### Phase 2: Component Integration

#### 2.1 Create shadcn Card Wrapper
Create a new file [`src/components/ui/Card.astro`](src/components/ui/Card.astro:1) that wraps the shadcn card component for Astro compatibility:

```astro
---
// Import shadcn card components
// Note: The exact import will depend on what shadcn provides
---

<!-- Card Container -->
<div class="rounded-lg border border-black/15 bg-white dark:border-white/20 dark:bg-black/50">
  <slot />
</div>
```

**Note**: The exact structure will depend on what the `@ss-components/card-06` component provides. It may include:
- Card container
- Card header
- Card content
- Card footer
- Image component

#### 2.2 Update WaitlistCard.astro
Replace the current [`WaitlistCard.astro`](src/components/WaitlistCard.astro:1) with a shadcn-based implementation:

```astro
---
import FormattedDate from "./FormattedDate.astro";
import Card from "./ui/Card.astro";

interface Props {
  title: string;
  description: string;
  date: Date;
  image?: string;
  waitlistURL?: string;
  status?: string;
  href?: string;
}

const { title, description, date, image, waitlistURL, status, href } = Astro.props;
---

<a href={href} class="block transition-colors duration-300 ease-in-out hover:bg-black/5 dark:hover:bg-white/5">
  <Card>
    <div class="flex flex-col sm:flex-row">
      <!-- Main Content -->
      <div class="flex flex-1 flex-col gap-2 p-4">
        <h3 class="font-semibold">{title}</h3>
        <p class="text-sm">{description}</p>
        <FormattedDate date={date} />

        <!-- Status and Actions -->
        <div class="mt-2 flex flex-wrap items-center gap-3">
          {status && (
            <span class="inline-flex items-center rounded-full border border-black/15 px-2 py-0.5 text-xs font-medium dark:border-white/20">
              {status}
            </span>
          )}
          {waitlistURL && (
            <a
              href={waitlistURL}
              class="underline decoration-black/30 underline-offset-[3px] hover:decoration-black/50 dark:decoration-white/30 dark:hover:decoration-white/50"
            >
              Join waitlist
            </a>
          )}
        </div>
      </div>

      <!-- Right Image -->
      {image && (
        <div class="flex-shrink-0 p-4 sm:w-32 sm:p-4">
          <img
            src={image}
            alt={title}
            class="h-32 w-full rounded-md object-cover sm:h-full"
            loading="lazy"
          />
        </div>
      )}
    </div>
  </Card>
</a>
```

### Phase 3: Image Path Fixes

#### 3.1 Update Waitlist Content Files
Fix the image path extensions in waitlist content files:

**[`src/content/waitlist/i18next-ai.md`](src/content/waitlist/i18next-ai.md:6)**:
```yaml
image: /images/i18next-ai.png  # Changed from .jpg to .png
```

**[`src/content/waitlist/speaking-ai.md`](src/content/waitlist/speaking-ai.md:6)**:
```yaml
image: /images/speaking-ai.jpeg  # Changed from .jpg to .jpeg
```

### Phase 4: Styling Adjustments

#### 4.1 Card Container Styling
Apply shadcn card styling while maintaining the project's design system:
- Border: `border border-black/15 dark:border-white/20`
- Background: `bg-white dark:bg-black/50`
- Border radius: `rounded-lg`
- Padding: As needed for the card layout

#### 4.2 Responsive Behavior
Ensure the card works correctly on:
- **Mobile (< 640px)**: Vertical stacking (content → image)
- **Desktop (≥ 640px)**: Horizontal row (content | image)

#### 4.3 Dark Mode Support
Maintain existing dark mode classes:
- Text colors: `dark:text-white`
- Border colors: `dark:border-white/20`
- Background colors: `dark:bg-black/50`
- Hover states: `dark:hover:bg-white/5`

### Phase 5: Testing and Verification

#### 5.1 Visual Testing
- [ ] Card layout matches design reference
- [ ] Image is positioned on the right side on desktop
- [ ] Status badge and join waitlist link are visible
- [ ] All waitlist items display correctly

#### 5.2 Responsive Testing
- [ ] Mobile view: Vertical stacking works correctly
- [ ] Desktop view: Horizontal layout displays properly
- [ ] Tablet view: Breakpoints work as expected

#### 5.3 Functional Testing
- [ ] All links (href and waitlistURL) navigate correctly
- [ ] Hover states work properly
- [ ] Dark mode toggles correctly
- [ ] Images load and display properly

#### 5.4 Integration Testing
- [ ] Component renders correctly on waitlist page
- [ ] Works with existing waitlist data
- [ ] No console errors in browser
- [ ] Page performance is not degraded

## Technical Details

### shadcn Component Structure
The `@ss-components/card-06` component likely provides:
- Card container with proper styling
- Responsive layout utilities
- Built-in dark mode support
- Consistent spacing and typography

### Props Interface (No Changes)
```typescript
interface Props {
  title: string;
  description: string;
  date: Date;
  image?: string;
  waitlistURL?: string;
  status?: string;
  href?: string;
}
```

### Tailwind Classes Reference

#### Card Container
- Base: `rounded-lg border border-black/15 bg-white dark:border-white/20 dark:bg-black/50`
- Hover: `hover:bg-black/5 dark:hover:bg-white/5`

#### Content Section
- Layout: `flex flex-1 flex-col gap-2 p-4`
- Typography: `font-semibold` for title, `text-sm` for description

#### Status Badge
- Base: `inline-flex items-center rounded-full border border-black/15 px-2 py-0.5 text-xs font-medium dark:border-white/20`

#### Join Waitlist Link
- Base: `underline decoration-black/30 underline-offset-[3px] hover:decoration-black/50 dark:decoration-white/30 dark:hover:decoration-white/50`

#### Image Section
- Layout: `flex-shrink-0 p-4 sm:w-32 sm:p-4`
- Image: `h-32 w-full rounded-md object-cover sm:h-full`

## Potential Edge Cases

1. **No status badge**: Card should display without status
2. **No waitlistURL**: Card should display without join waitlist link
3. **Neither present**: Card should display without either element
4. **No image**: Right section should not render
5. **Very long titles/descriptions**: Should wrap properly in content section
6. **Very long status text**: Should truncate or wrap appropriately
7. **Image loading failure**: Should handle gracefully with alt text

## Success Criteria

- [ ] shadcn card component installed successfully
- [ ] Components stored in `src/components/ui/`
- [ ] WaitlistCard uses shadcn card component
- [ ] Image appears on the right side of the card on desktop
- [ ] Status badge and join waitlist link are visible and properly styled
- [ ] Layout is responsive and works correctly on mobile devices
- [ ] All existing functionality is preserved
- [ ] No visual regressions in dark mode
- [ ] Component passes accessibility checks
- [ ] Image path extensions are corrected in waitlist content files

## Files to Modify

### Primary Changes
1. **Install**: Execute `pnpm dlx shadcn@latest add @ss-components/card-06`
2. **Create**: [`src/components/ui/Card.astro`](src/components/ui/Card.astro:1) - shadcn card wrapper
3. **Update**: [`src/components/WaitlistCard.astro`](src/components/WaitlistCard.astro:1) - Use shadcn card
4. **Fix**: [`src/content/waitlist/i18next-ai.md`](src/content/waitlist/i18next-ai.md:6) - Image extension
5. **Fix**: [`src/content/waitlist/speaking-ai.md`](src/content/waitlist/speaking-ai.md:6) - Image extension

### Files to Review (No Changes Expected)
1. [`src/pages/waitlist/index.astro`](src/pages/waitlist/index.astro:1) - Waitlist page using the component
2. [`package.json`](package.json:1) - Dependencies (will be updated by shadcn CLI)

## Implementation Order

1. Install shadcn card component
2. Verify component structure and dependencies
3. Create shadcn card wrapper for Astro
4. Update WaitlistCard.astro to use shadcn card
5. Fix image path extensions in waitlist content files
6. Test the updated component
7. Verify responsive behavior
8. Check dark mode support
9. Final verification

## Next Steps

Once this plan is approved, switch to **Orchestrator mode** to implement the changes. The Orchestrator will:
1. Execute the shadcn component installation
2. Create the necessary component files
3. Update the WaitlistCard component
4. Fix image path issues
5. Test the implementation
6. Verify all functionality works correctly
