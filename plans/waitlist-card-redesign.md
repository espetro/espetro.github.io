# WaitlistCard Component Redesign Plan

## Overview
Update the `WaitlistCard.astro` component to match a new design where the image is positioned on the right side, and the status badge and "Join waitlist" link are positioned on the left side.

## Current State Analysis

### Current Layout Structure
The current [`WaitlistCard.astro`](src/components/WaitlistCard.astro:1) component has:
- A flex container that switches from column (mobile) to row (desktop)
- Content area containing: title, status badge, description, date, and join waitlist link
- Image positioned on the right with `sm:ml-4` and `sm:w-32` classes

### Current Desktop Layout
```
┌─────────────────────────────────────┬────────┐
│ Title [Status]                      │        │
│ Description                         │  Image  │
│ Date                                │        │
│ Join waitlist                       │        │
└─────────────────────────────────────┴────────┘
```

## Proposed Design

### New Layout Structure
The redesigned component will use a three-column layout on desktop:

```
┌──────┬────────────────────────────────┬────────┐
│      │ Title                          │        │
│Status│ Description                     │  Image  │
│      │ Date                           │        │
│Join  │                                │        │
│waitlist│                               │        │
└──────┴────────────────────────────────┴────────┘
```

### Layout Specifications

#### Left Sidebar (Status & Actions)
- **Width**: Fixed width (e.g., `w-24` or `w-32`)
- **Content**:
  - Status badge (if present)
  - "Join waitlist" link (if present)
- **Alignment**: Vertically centered or top-aligned
- **Mobile**: Stacks above content

#### Middle Section (Main Content)
- **Width**: Flexible (`flex-1`)
- **Content**:
  - Title (h3)
  - Description (p)
  - FormattedDate
- **Mobile**: Standard vertical stacking

#### Right Section (Image)
- **Width**: Fixed width (e.g., `w-32` or `w-40`)
- **Content**: Image with object-cover
- **Mobile**: Stacks below content or hidden

## Implementation Plan

### 1. Component Structure Changes

**Current Structure:**
```astro
<a href={href} class="flex flex-col sm:flex-row">
  <div class="flex flex-1 flex-col gap-2">
    <!-- Content: title, status, description, date, join waitlist -->
  </div>
  {image && <div class="sm:ml-4 sm:w-32"><img /></div>}
</a>
```

**Proposed Structure:**
```astro
<a href={href} class="flex flex-col sm:flex-row">
  <!-- Left Sidebar -->
  <div class="flex flex-row sm:flex-col gap-2 sm:w-24 sm:items-start sm:justify-start">
    {status && <span class="status-badge">{status}</span>}
    {waitlistURL && <a href={waitlistURL} class="join-waitlist-link">Join waitlist</a>}
  </div>

  <!-- Middle Content -->
  <div class="flex flex-1 flex-col gap-2">
    <h3 class="font-semibold">{title}</h3>
    <p class="text-sm">{description}</p>
    <FormattedDate date={date} />
  </div>

  <!-- Right Image -->
  {image && (
    <div class="sm:ml-4 sm:w-32 sm:flex-shrink-0">
      <img src={image} alt={title} class="h-32 w-full rounded-md object-cover sm:h-full" loading="lazy" />
    </div>
  )}
</a>
```

### 2. Styling Considerations

#### Left Sidebar Styling
- Mobile: Horizontal layout (`flex-row`) with gap
- Desktop: Vertical layout (`flex-col`) with fixed width
- Status badge: Maintain existing styling but adjust for new position
- Join waitlist link: Maintain existing underline styling

#### Responsive Behavior
- **Mobile (< 640px)**: Vertical stack (left sidebar → content → image)
- **Desktop (≥ 640px)**: Horizontal row (left sidebar | content | image)

#### Dark Mode Support
- Maintain existing dark mode classes for borders, hover states, and text colors

### 3. Accessibility Considerations
- Ensure proper focus states are maintained
- Verify keyboard navigation works correctly
- Check that status badge and join waitlist link are properly accessible
- Maintain ARIA attributes if any are added

### 4. Testing Checklist

#### Visual Testing
- [ ] Verify layout matches design reference
- [ ] Check image positioning on the right
- [ ] Verify status badge and join waitlist link are on the left
- [ ] Test with and without optional props (status, waitlistURL, image)

#### Responsive Testing
- [ ] Mobile view (< 640px): Vertical stacking works correctly
- [ ] Desktop view (≥ 640px): Three-column layout displays properly
- [ ] Tablet view: Verify breakpoints work as expected

#### Functional Testing
- [ ] All links (href and waitlistURL) navigate correctly
- [ ] Hover states work properly
- [ ] Dark mode toggles correctly
- [ ] Images load and display properly

#### Integration Testing
- [ ] Component renders correctly on waitlist page
- [ ] Works with existing waitlist data (i18next-ai, speaking-ai)
- [ ] No console errors in browser
- [ ] Page performance is not degraded

## Technical Details

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

#### Left Sidebar
- Mobile: `flex flex-row gap-2`
- Desktop: `sm:flex-col sm:w-24 sm:items-start sm:justify-start`

#### Status Badge
- Existing: `inline-flex items-center rounded-full border border-black/15 px-2 py-0.5 text-xs font-medium dark:border-white/20`
- May need adjustment for left sidebar positioning

#### Join Waitlist Link
- Existing: `underline decoration-black/30 underline-offset-[3px] hover:decoration-black/50 dark:decoration-white/30 dark:hover:decoration-white/50`
- May need adjustment for left sidebar positioning

## Potential Edge Cases

1. **No status badge**: Left sidebar should only show join waitlist link
2. **No waitlist URL**: Left sidebar should only show status badge
3. **Neither status nor waitlist URL**: Left sidebar may be empty or hidden
4. **No image**: Right section should not render
5. **Very long titles/descriptions**: Should wrap properly in middle section
6. **Very long status text**: Should truncate or wrap appropriately

## Success Criteria

- [ ] Image appears on the right side of the card on desktop
- [ ] Status badge appears on the left side of the card on desktop
- [ ] "Join waitlist" link appears on the left side of the card on desktop
- [ ] Layout is responsive and works correctly on mobile devices
- [ ] All existing functionality is preserved
- [ ] No visual regressions in dark mode
- [ ] Component passes accessibility checks

## Files to Modify

1. **Primary**: [`src/components/WaitlistCard.astro`](src/components/WaitlistCard.astro:1) - Component structure and styling

## Files to Review (No Changes Expected)

1. [`src/pages/waitlist/index.astro`](src/pages/waitlist/index.astro:1) - Waitlist page using the component
2. [`src/content/waitlist/i18next-ai.md`](src/content/waitlist/i18next-ai.md:1) - Example waitlist item
3. [`src/content/waitlist/speaking-ai.md`](src/content/waitlist/speaking-ai.md:1) - Example waitlist item

## Next Steps

Once this plan is approved, switch to **Orchestrator mode** to implement the changes. The Orchestrator will:
1. Execute the component structure changes
2. Apply the new styling
3. Test the responsive behavior
4. Verify integration with the waitlist page
5. Perform final quality checks
