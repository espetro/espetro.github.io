# WaitlistCard Random Background Color Feature

## Overview
Add a feature to [`WaitlistCard.astro`](src/components/WaitlistCard.astro:1) that allows the card to have a random background color on each page reload. The color must maintain good contrast with the black text color used in the component.

## Requirements

### Functional Requirements
1. Add a flag prop to enable/disable random background color
2. Generate a random color with good contrast to black text
3. Apply the random background color when the flag is enabled
4. The color should change on each page reload

### Visual Requirements
1. **Good Contrast**: The background color must have sufficient contrast with black text
   - Use pastel colors (high lightness, low saturation)
   - Or use colors with reduced alpha channel (transparency)
   - Target contrast ratio: at least 4.5:1 for WCAG AA compliance

2. **Color Palette Options**:
   - **Pastel Colors**: High lightness (70-90%), low to medium saturation (10-40%)
   - **Transparent Colors**: Low alpha channel (0.1-0.3) with any hue
   - **Light Colors**: High lightness (80-95%) with any saturation

## Implementation Plan

### Phase 1: Add Prop Interface

#### 1.1 Update Props Interface
Add a new optional prop to enable random background color:

```typescript
interface Props extends Omit<Data, "draft"> {
  href?: string;
  randomBackgroundColor?: boolean; // New prop
}
```

### Phase 2: Implement Random Color Generation

#### 2.1 Color Generation Strategy
Implement a function to generate random colors with good contrast:

**Option A: Pastel Colors (HSL)**
```typescript
function generatePastelColor(): string {
  // Hue: 0-360 (random)
  // Saturation: 10-40% (low to medium)
  // Lightness: 70-90% (high for good contrast)
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30) + 10;
  const lightness = Math.floor(Math.random() * 20) + 70;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
```

**Option B: Transparent Colors (RGBA)**
```typescript
function generateTransparentColor(): string {
  // Hue: 0-360 (random)
  // Saturation: 0-100% (any)
  // Lightness: 50-70% (medium)
  // Alpha: 0.1-0.3 (low transparency)
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 100);
  const lightness = Math.floor(Math.random() * 20) + 50;
  const alpha = (Math.random() * 0.2 + 0.1).toFixed(2);
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}
```

**Option C: Light Colors (HSL)**
```typescript
function generateLightColor(): string {
  // Hue: 0-360 (random)
  // Saturation: 0-60% (low to medium)
  // Lightness: 80-95% (very high for good contrast)
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 60);
  const lightness = Math.floor(Math.random() * 15) + 80;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
```

#### 2.2 Recommended Approach
Use **Option A (Pastel Colors)** as the primary approach because:
- Provides the best contrast with black text
- Creates a visually pleasing, soft aesthetic
- Consistent with modern design trends
- Easy to implement and understand

### Phase 3: Apply Random Background Color

#### 3.1 Conditional Background Application
Apply the random background color only when the flag is enabled:

```astro
---
import type { CollectionEntry } from "astro:content";
import FormattedDate from "./FormattedDate.astro";
import Card from "./ui/Card.astro";

type Data = CollectionEntry<"waitlist">["data"];

interface Props extends Omit<Data, "draft"> {
  href?: string;
  randomBackgroundColor?: boolean;
}

const { title, description, date, image, waitlistURL, status, href, randomBackgroundColor } =
  Astro.props;

// Generate random pastel color if enabled
const backgroundColor = randomBackgroundColor
  ? (() => {
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 30) + 10;
      const lightness = Math.floor(Math.random() * 20) + 70;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    })()
  : undefined;
---

<a
  href={href}
  class="block transition-colors duration-300 ease-in-out hover:bg-black/5 dark:hover:bg-white/5"
>
  <Card style={backgroundColor ? `background-color: ${backgroundColor}` : undefined}>
    <!-- Rest of the component -->
  </Card>
</a>
```

#### 3.2 Dark Mode Considerations
For dark mode, we have two options:

**Option A: Use the same pastel color for both modes**
- Pros: Consistent experience, simpler implementation
- Cons: May not look optimal in dark mode

**Option B: Generate different colors for light/dark mode**
- Pros: Better visual integration with each mode
- Cons: More complex implementation

**Recommended**: Use Option A (same color for both modes) as pastel colors work well in both light and dark modes due to their high lightness.

### Phase 4: Integration with Waitlist Page

#### 4.1 Update Waitlist Page Usage
Update [`src/pages/waitlist/index.astro`](src/pages/waitlist/index.astro:1) to enable the random background color:

```astro
<WaitlistCard
  title={_.title}
  description={_.description}
  date={_.date}
  image={_.image}
  waitlistURL={_.waitlistURL}
  status={_.status}
  href={`/waitlist/${id}`}
  randomBackgroundColor={true} // Enable random background
/>
```

#### 4.2 Optional: Make it Configurable
The `randomBackgroundColor` prop can be:
- Set to `true` to enable
- Set to `false` or omitted to disable
- Made configurable per card if needed

### Phase 5: Testing and Verification

#### 5.1 Visual Testing
- [ ] Random background color appears when flag is enabled
- [ ] Background color changes on each page reload
- [ ] Color has good contrast with black text
- [ ] Color works well in both light and dark modes
- [ ] No background color appears when flag is disabled

#### 5.2 Functional Testing
- [ ] Card remains clickable with random background
- [ ] Hover states work correctly with random background
- [ ] All other functionality is preserved
- [ ] No console errors related to color generation

#### 5.3 Accessibility Testing
- [ ] Text remains readable with random background
- [ ] Contrast ratio meets WCAG AA standards (4.5:1)
- [ ] Color doesn't cause visual discomfort
- [ ] Works with screen readers

## Technical Details

### Color Generation Algorithm
The pastel color generation uses HSL color space:
- **Hue**: 0-360 (any color)
- **Saturation**: 10-40% (low to medium for soft appearance)
- **Lightness**: 70-90% (high for good contrast with black text)

### Contrast Ratio
Pastel colors with 70-90% lightness typically provide:
- Contrast ratio with black text: 7:1 to 12:1
- Exceeds WCAG AA requirement of 4.5:1
- Meets WCAG AAA requirement of 7:1 for most colors

### Styling Application
The random background color is applied via inline style:
```astro
<Card style={backgroundColor ? `background-color: ${backgroundColor}` : undefined}>
```

This approach:
- Allows dynamic color generation
- Doesn't require CSS class generation
- Works with Astro's server-side rendering
- Maintains component reusability

## Potential Edge Cases

1. **No flag provided**: Default to no random background (current behavior)
2. **Flag set to false**: No random background (current behavior)
3. **Flag set to true**: Generate and apply random pastel background
4. **Multiple cards on page**: Each card gets a different random color
5. **Page reload**: New random colors generated for each card

## Success Criteria

- [ ] New `randomBackgroundColor` prop added to Props interface
- [ ] Random pastel color generated when flag is enabled
- [ ] Background color changes on each page reload
- [ ] Color has good contrast with black text (≥ 4.5:1)
- [ ] Works correctly in both light and dark modes
- [ ] No visual regressions when flag is disabled
- [ ] All existing functionality is preserved
- [ ] Component remains accessible with random background

## Files to Modify

### Primary Changes
1. **Update**: [`src/components/WaitlistCard.astro`](src/components/WaitlistCard.astro:1)
   - Add `randomBackgroundColor` prop to interface
   - Implement random color generation function
   - Apply random background color conditionally

### Optional Changes
2. **Update**: [`src/pages/waitlist/index.astro`](src/pages/waitlist/index.astro:1)
   - Enable `randomBackgroundColor` flag for waitlist cards

## Implementation Order

1. Add `randomBackgroundColor` prop to Props interface
2. Implement random pastel color generation function
3. Apply random background color conditionally via inline style
4. Test with flag enabled and disabled
5. Verify contrast ratios and accessibility
6. Test page reload behavior
7. Verify dark mode compatibility

## Next Steps

Once this plan is approved, switch to **Code mode** to implement the changes. The implementation will:
1. Add the prop to the interface
2. Implement the color generation function
3. Apply the background color conditionally
4. Test the functionality

## Example Usage

```astro
<!-- With random background color -->
<WaitlistCard
  title="i18next-ai"
  description="An i18next plugin to generate AI translations"
  date={new Date("2025-01-22")}
  image="/images/i18next-ai.png"
  waitlistURL="https://example.com/waitlist/i18next-ai"
  status="coming soon"
  href="/waitlist/i18next-ai"
  randomBackgroundColor={true}
/>

<!-- Without random background color -->
<WaitlistCard
  title="Speaking AI"
  description="A web app to improve your conversational skills"
  date={new Date("2025-01-22")}
  image="/images/speaking-ai.jpeg"
  waitlistURL="https://example.com/waitlist/speaking-ai"
  status="coming soon"
  href="/waitlist/speaking-ai"
  randomBackgroundColor={false}
/>
```
