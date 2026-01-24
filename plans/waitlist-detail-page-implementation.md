# Waitlist Detail Page Implementation Plan

## Overview

This plan outlines the implementation of a waitlist detail page that displays project information and includes a form for users to join the waitlist. The implementation will use shadcn components for UI and react-hook-form for form handling.

## Project Structure

```
src/
├── pages/
│   └── waitlist/
│       ├── index.astro (existing)
│       └── [...id].astro (new)
├── components/
│   ├── ui/
│   │   ├── Card.astro (existing, may need updates)
│   │   ├── Button.astro (new)
│   │   ├── Input.astro (new)
│   │   ├── Label.astro (new)
│   │   ├── Badge.astro (new)
│   │   └── Form.astro (new)
│   ├── WaitlistCard.astro (existing)
│   ├── WaitlistDetailCard.astro (new)
│   └── WaitlistForm.tsx (new React component)
└── lib/
    └── utils.ts (existing, may need updates)
```

## Implementation Steps

### Phase 1: Dependencies and Setup

#### 1.1 Install Required Packages

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
```

#### 1.2 Update Astro Configuration

Update `astro.config.mjs` to include React integration if not already present:

```javascript
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [react(), /* other integrations */],
  // ... rest of config
});
```

### Phase 2: shadcn UI Components

#### 2.1 Create Button Component (`src/components/ui/Button.astro`)

```astro
---
interface Props {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  class?: string;
}

const {
  variant = 'default',
  size = 'default',
  disabled = false,
  type = 'button',
  class: className,
} = Astro.props;

const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
};

const sizeClasses = {
  default: 'h-10 py-2 px-4',
  sm: 'h-9 px-3 rounded-md',
  lg: 'h-11 px-8 rounded-md',
};
---

<button
  type={type}
  disabled={disabled}
  class:list={[
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ]}
>
  <slot />
</button>
```

#### 2.2 Create Input Component (`src/components/ui/Input.astro`)

```astro
---
interface Props {
  type?: 'text' | 'email' | 'password' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  class?: string;
}

const {
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  class: className,
} = Astro.props;

const baseClasses = 'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
---

<input
  type={type}
  placeholder={placeholder}
  disabled={disabled}
  required={required}
  class:list={[baseClasses, className]}
/>
```

#### 2.3 Create Label Component (`src/components/ui/Label.astro`)

```astro
---
interface Props {
  for?: string;
  class?: string;
}

const { for: htmlFor, class: className } = Astro.props;
---

<label
  for={htmlFor}
  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 {className}"
>
  <slot />
</label>
```

#### 2.4 Create Badge Component (`src/components/ui/Badge.astro`)

```astro
---
interface Props {
  variant?: 'default' | 'secondary' | 'outline';
  class?: string;
}

const {
  variant = 'default',
  class: className,
} = Astro.props;

const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

const variantClasses = {
  default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'text-foreground',
};
---

<div
  class:list={[
    baseClasses,
    variantClasses[variant],
    className
  ]}
>
  <slot />
</div>
```

#### 2.5 Update Card Component (`src/components/ui/Card.astro`)

Enhance the existing Card component to match shadcn patterns:

```astro
---
interface Props {
  class?: string;
}

const { class: className } = Astro.props;
---

<div class="rounded-lg border bg-card text-card-foreground shadow-sm {className}">
  <slot />
</div>
```

### Phase 3: Waitlist Form Component

#### 3.1 Create Form Schema (`src/lib/waitlist-schema.ts`)

```typescript
import { z } from 'zod';

export const waitlistFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  message: z.string().optional(),
});

export type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;
```

#### 3.2 Create Waitlist Form Component (`src/components/WaitlistForm.tsx`)

```tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waitlistFormSchema, WaitlistFormValues } from '@lib/waitlist-schema';

interface WaitlistFormProps {
  waitlistURL: string;
  projectTitle: string;
}

export default function WaitlistForm({ waitlistURL, projectTitle }: WaitlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
  });

  const onSubmit = async (data: WaitlistFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch(waitlistURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          project: projectTitle,
          source: 'espetro-waitlist',
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
      } else {
        throw new Error('Failed to submit to waitlist');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {submitStatus === 'success' ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-green-800 font-medium">Thank you for joining!</h3>
          <p className="text-green-700 text-sm mt-1">
            You've been added to the waitlist for {projectTitle}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email *
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-1">
              Company (optional)
            </label>
            <input
              id="company"
              type="text"
              {...register('company')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Why are you interested? (optional)
            </label>
            <textarea
              id="message"
              rows={3}
              {...register('message')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {submitStatus === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Joining...' : 'Join Waitlist'}
          </button>
        </form>
      )}
    </div>
  );
}
```

### Phase 4: Waitlist Detail Page

#### 4.1 Create Waitlist Detail Page (`src/pages/waitlist/[...id].astro`)

```astro
---
import { getEntry } from "astro:content";
import Layout from "@layouts/Layout.astro";
import Container from "@components/Container.astro";
import Card from "@components/ui/Card.astro";
import Badge from "@components/ui/Badge.astro";
import WaitlistForm from "@components/WaitlistForm";
import { WAITLIST } from "@consts";

export async function getStaticPaths() {
  const waitlistEntries = await getCollection("waitlist");
  return waitlistEntries.map((entry) => ({
    params: { id: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { data } = entry;

// If waitlistURL is not provided, use a default endpoint
const formActionURL = data.waitlistURL || "https://api.example.com/waitlist";
---

<Layout title={`${data.title} - ${WAITLIST.TITLE}`} description={data.description}>
  <Container>
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Back Link -->
      <a 
        href="/waitlist" 
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        ← Back to waitlist
      </a>

      <!-- Project Details Card -->
      <Card>
        <div class="p-6 md:p-8">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Project Image -->
            {data.image && (
              <div class="md:w-1/3">
                <img 
                  src={data.image} 
                  alt={data.title}
                  class="w-full h-48 md:h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <!-- Project Information -->
            <div class="flex-1 space-y-4">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <h1 class="text-2xl md:text-3xl font-bold">{data.title}</h1>
                  {data.status && (
                    <Badge variant="secondary">{data.status}</Badge>
                  )}
                </div>
                <p class="text-gray-600 dark:text-gray-400">{data.description}</p>
              </div>

              {data.content && (
                <div class="prose prose-gray dark:prose-invert max-w-none">
                  <data.content />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <!-- Waitlist Form Section -->
      <Card>
        <div class="p-6 md:p-8">
          <h2 class="text-xl font-semibold mb-4">Join the Waitlist</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Be the first to know when {data.title} is available. Sign up for our waitlist and get early access.
          </p>
          
          <ClientOnly>
            <WaitlistForm waitlistURL={formActionURL} projectTitle={data.title} />
          </ClientOnly>
        </div>
      </Card>
    </div>
  </Container>
</Layout>
```

### Phase 5: Updates and Integration

#### 5.1 Update WaitlistCard Component

Update the existing `WaitlistCard.astro` to ensure the href points to the new detail page:

```astro
---
// ... existing imports and interface

const {
  title,
  description,
  date,
  image,
  waitlistURL,
  status,
  href,
  randomBackgroundColor,
} = Astro.props;

// If href is not provided, don't make it a link
const isClickable = href && href !== '#';
---

{isClickable ? (
  <a
    href={href}
    class="block transition-colors duration-300 ease-in-out hover:bg-black/5 dark:hover:bg-white/5"
  >
    <!-- ... rest of component -->
  </a>
) : (
  <div>
    <!-- ... rest of component without link wrapper -->
  </div>
)}
```

#### 5.2 Update Content Configuration

Ensure the waitlist content schema supports the new fields needed for the detail page:

```typescript
// src/content.config.ts
const waitlist = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: "./content/waitlist" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    waitlistURL: z.string().optional(),
    image: z.string().optional(),
    status: z.string().optional(),
    randomBackgroundColor: z.boolean().optional(),
    content: z.any().optional(), // Allow rich content for detail pages
  }),
});
```

### Phase 6: Testing and Verification

#### 6.1 Visual Testing

- [ ] Verify the waitlist detail page displays correctly
- [ ] Check that project information is properly formatted
- [ ] Ensure images display correctly
- [ ] Verify status badges appear correctly

#### 6.2 Form Testing

- [ ] Test form validation for required fields
- [ ] Test form submission with valid data
- [ ] Test error handling for failed submissions
- [ ] Verify success message displays correctly
- [ ] Test form with optional fields

#### 6.3 Responsive Testing

- [ ] Verify the page works on mobile devices
- [ ] Check tablet view formatting
- [ ] Ensure desktop layout is correct

#### 6.4 Integration Testing

- [ ] Test navigation from waitlist index to detail page
- [ ] Verify back navigation works correctly
- [ ] Check that all waitlist items link correctly

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

## Implementation Order

1. Install required dependencies
2. Create shadcn UI components
3. Create form validation schema
4. Implement WaitlistForm React component
5. Create waitlist detail page
6. Update existing components
7. Test functionality
8. Verify responsive design
9. Check dark mode support
10. Final integration testing

## Next Steps

Once this plan is approved, switch to **Orchestrator mode** to implement the changes. The Orchestrator will:

1. Execute the dependency installations
2. Create all necessary components
3. Implement the waitlist detail page
4. Update existing components
5. Test the implementation
6. Verify all functionality works correctly
7. Ensure responsive design and dark mode support
8. Perform final quality checks