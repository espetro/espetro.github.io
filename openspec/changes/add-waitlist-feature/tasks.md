# Implementation Tasks

## 1. Setup

- [ ] 1.1 Add WAITLIST constant to `src/consts.ts` with TITLE and DESCRIPTION
- [ ] 1.2 Add NUM_WAITLIST_ON_HOMEPAGE constant to SITE in `src/consts.ts`

## 2. Content Collection

- [ ] 2.1 Add `waitlist` collection to `src/content.config.ts` with schema:
  - title: string
  - description: string
  - date: date
  - draft: boolean (optional)
  - waitlistURL: string (optional)
  - image: string (optional)
  - status: string (optional, e.g., "coming soon", "beta")

## 3. Create WaitlistCard Component

- [ ] 3.1 Create `src/components/WaitlistCard.astro` with layout:
  - Left: Title and description text
  - Right: Image preview
  - Hover effects for interactivity
  - Arrow indicator on right edge

## 4. Create Waitlist Page

- [ ] 4.1 Create `src/pages/waitlist/index.astro` displaying all waitlist items
- [ ] 4.2 Use WaitlistCard component for each item
- [ ] 4.3 Sort items by date (newest first)

## 5. Update Landing Page

- [ ] 5.1 Fetch waitlist items on homepage
- [ ] 5.2 Add waitlist section before blog section
- [ ] 5.3 Use WaitlistCard component for items (limit to NUM_WAITLIST_ON_HOMEPAGE)
- [ ] 5.4 Add "See all waitlist items" link to waitlist page

## 6. Add Sample Content

- [ ] 6.1 Create `src/content/waitlist/` directory
- [ ] 6.2 Add at least one example waitlist item with image

## 7. Testing

- [ ] 7.1 Verify landing page displays waitlist section in correct position
- [ ] 7.2 Verify waitlist page lists all items
- [ ] 7.3 Verify WaitlistCard displays correctly with image on right
- [ ] 7.4 Test responsive design on mobile
