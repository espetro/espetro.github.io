## ADDED Requirements

### Requirement: Waitlist Content Collection

The system SHALL provide a waitlist content collection for managing upcoming projects and ideas that users can join.

#### Scenario: Create waitlist item

- **WHEN** author creates a waitlist item with title, description, date, and optional fields (waitlistURL, image, status, draft)
- **THEN** the item is successfully added to the waitlist collection

#### Scenario: Retrieve waitlist items

- **WHEN** the system fetches waitlist collection items
- **THEN** it returns all non-draft items sorted by date (newest first)

### Requirement: Waitlist Page

The system SHALL provide a dedicated waitlist page displaying all waitlist items.

#### Scenario: View waitlist page

- **WHEN** user navigates to /waitlist
- **THEN** the page displays all non-draft waitlist items as cards with title, description, and image

#### Scenario: Waitlist items sorted

- **WHEN** waitlist page loads
- **THEN** items are sorted by date in descending order (newest first)

### Requirement: Landing Page Waitlist Section

The system SHALL display a waitlist section on the landing page before the blog section.

#### Scenario: Landing page waitlist section

- **WHEN** user views the homepage
- **THEN** a waitlist section appears before the blog section
- **AND** it displays up to NUM_WAITLIST_ON_HOMEPAGE items
- **AND** each item is shown as a card with text on left and image on right

#### Scenario: Waitlist section navigation

- **WHEN** user clicks "See all waitlist items" link
- **THEN** user is navigated to the waitlist page

### Requirement: Waitlist Card Component

The system SHALL provide a WaitlistCard component displaying waitlist items with text on the left and image on the right.

#### Scenario: Waitlist card display

- **WHEN** a waitlist item is rendered as a WaitlistCard
- **THEN** it displays title and description text on the left side
- **AND** it displays an optional preview image on the right side
- **AND** it includes an arrow indicator on the right edge
- **AND** it has hover effects indicating interactivity

#### Scenario: Waitlist card click

- **WHEN** user clicks on a WaitlistCard
- **THEN** user is navigated to the waitlist item's detail page

### Requirement: Waitlist Metadata

The system SHALL provide waitlist configuration constants in the consts file.

#### Scenario: Waitlist constants

- **WHEN** the consts file includes WAITLIST constant
- **THEN** it provides TITLE and DESCRIPTION for the waitlist page
- **AND** SITE constant includes NUM_WAITLIST_ON_HOMEPAGE to control homepage display

## MODIFIED Requirements

### Requirement: Content Collections

The content collections SHALL include the waitlist collection alongside blog and projects.

#### Scenario: Content collection registration

- **WHEN** content.config.ts defines collections
- **THEN** it includes blog, projects, and waitlist collections
- **AND** each collection has appropriate schema validation

## REMOVED Requirements

None
