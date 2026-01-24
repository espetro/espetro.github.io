# Waitlist Detail Page Implementation - Handover to Orchestrator

## Project Overview

We need to implement a waitlist detail page for the Astro project that displays project information and includes a form for users to join the waitlist. The implementation will use shadcn components for UI and react-hook-form for form handling.

## Key Requirements

1. Create a dynamic waitlist detail page at `/waitlist/[id]`
2. Display project information including title, description, image, and status
3. Implement a signup form using react-hook-form with Zod validation
4. Use shadcn components for consistent UI styling
5. Ensure responsive design and dark mode support
6. Handle form submission to external waitlistURL

## Implementation Plan Reference

The detailed implementation plan is available in [`waitlist-detail-page-implementation.md`](waitlist-detail-page-implementation.md).

## Key Implementation Steps

### 1. Dependencies Installation
```bash
# Install shadcn CLI if not already installed
pnpm add -D @shadcn/ui

# Install required shadcn components
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add form

# Install react-hook-form and validation
pnpm add react-hook-form @hookform/resolvers zod

# Install React integration for Astro if not already present
pnpm add @astrojs/react
```

### 2. Component Creation
Create the following components in `src/components/ui/`:
- `Button.astro` - Button component following shadcn patterns
- `Input.astro` - Input component for form fields
- `Label.astro` - Label component for form labels
- `Badge.astro` - Badge component for status display
- Update existing `Card.astro` to match shadcn patterns

### 3. Form Implementation
Create:
- `src/lib/waitlist-schema.ts` - Zod validation schema
- `src/components/WaitlistForm.tsx` - React form component with react-hook-form

### 4. Page Creation
Create `src/pages/waitlist/[...id].astro` - Dynamic waitlist detail page

### 5. Integration Updates
- Update `src/components/WaitlistCard.astro` for proper navigation
- Update `src/content.config.ts` to support rich content
- Update `astro.config.mjs` to include React integration if needed

## Technical Considerations

### React Integration
The form component will be a React component integrated into Astro using:
- `<ClientOnly>` component for client-side rendering
- Props passed from Astro page to React component
- Proper hydration strategy

### Form Handling
- Form validation using Zod schema
- Client-side validation with react-hook-form
- Form submission to external waitlistURL via fetch API
- Error handling and success states

### Styling
- Maintain existing dark mode support
- Use Tailwind CSS classes consistent with project
- Ensure responsive design works on all device sizes

## Testing Requirements

1. **Visual Testing**
   - Verify page displays correctly with all waitlist items
   - Check image display and formatting
   - Ensure status badges appear correctly

2. **Form Testing**
   - Test form validation for required fields
   - Test form submission with valid data
   - Test error handling for failed submissions
   - Verify success message displays correctly

3. **Responsive Testing**
   - Verify mobile view (< 640px)
   - Check tablet view formatting
   - Ensure desktop layout is correct

4. **Integration Testing**
   - Test navigation from waitlist index to detail page
   - Verify back navigation works correctly
   - Check all waitlist items link correctly

## Success Criteria

- [ ] Waitlist detail page created at `/waitlist/[id]`
- [ ] Page displays project information correctly
- [ ] Form implemented with react-hook-form and Zod validation
- [ ] Form submission works with external waitlistURL
- [ ] shadcn components integrated and styled consistently
- [ ] Responsive design works on all device sizes
- [ ] Dark mode support maintained
- [ ] Form validation provides clear feedback
- [ ] Error handling works for failed submissions
- [ ] Success state displays appropriate message

## Files to Create/Modify

### New Files
1. `src/pages/waitlist/[...id].astro` - Waitlist detail page
2. `src/components/ui/Button.astro` - Button component
3. `src/components/ui/Input.astro` - Input component
4. `src/components/ui/Label.astro` - Label component
5. `src/components/ui/Badge.astro` - Badge component
6. `src/components/WaitlistForm.tsx` - React form component
7. `src/lib/waitlist-schema.ts` - Form validation schema

### Modified Files
1. `src/components/ui/Card.astro` - Enhanced to match shadcn patterns
2. `src/components/WaitlistCard.astro` - Updated for better navigation
3. `src/content.config.ts` - Updated schema for rich content
4. `astro.config.mjs` - Add React integration if needed
5. `package.json` - Updated dependencies

## Implementation Priority

1. Install all required dependencies
2. Create shadcn UI components
3. Implement form validation schema
4. Create WaitlistForm React component
5. Implement waitlist detail page
6. Update existing components
7. Test form functionality
8. Verify responsive design
9. Check dark mode support
10. Final integration testing

## Next Steps

Please proceed with implementing the waitlist detail page following the detailed plan in [`waitlist-detail-page-implementation.md`](waitlist-detail-page-implementation.md).

After implementation, please:
1. Test all functionality thoroughly
2. Verify responsive design on different device sizes
3. Check dark mode support
4. Ensure form validation works correctly
5. Test form submission and error handling

If you encounter any issues or need clarification on any aspect of the implementation, please refer to the detailed implementation plan or ask for clarification.