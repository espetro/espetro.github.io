# Change: Add waitlist section to landing page

## Why

Add a dedicated section on the landing page to showcase upcoming projects/ideas that users can join waitlists for, increasing user engagement and building anticipation for future releases.

## What Changes

- Add new `waitlist` content collection with schema (title, description, date, draft, waitlistURL, image, status)
- Create `src/pages/waitlist/index.astro` page to display all waitlist items
- Create `WaitlistCard` component with image on right, text on left layout
- Update landing page (`src/pages/index.astro`) to display waitlist section before blog section
- Update content config to include waitlist collection
- Add WAITLIST constant to `src/consts.ts`
- Configure number of waitlist items to show on homepage in `src/consts.ts`

## Impact

- Affected specs: `waitlist` (new capability)
- Affected code:
  - `src/pages/index.astro` - add waitlist section
  - `src/content.config.ts` - add waitlist collection
  - `src/consts.ts` - add WAITLIST constant and NUM_WAITLIST_ON_HOMEPAGE
  - `src/pages/waitlist/index.astro` (new)
  - `src/components/WaitlistCard.astro` (new)
  - `src/content/waitlist/` (new directory for waitlist content)
