# Keystatic Setup Guide

Keystatic has been integrated into this Astro project. It provides a web-based CMS for managing content without editing MDX files or running git commands.

## Quick Start

### Local Development

The `.env` file in your local checkout has `ENABLE_KEYSTATIC=true`, which enables the admin UI.

```bash
pnpm dev
```
Visit `http://localhost:4321/keystatic` to access the admin UI.

### First-Time Setup (OAuth)
1. With the dev server running, go to `http://localhost:4321/keystatic`
2. Click "GitHub" to initiate login
3. Follow the setup wizard to create a GitHub App for this repository
4. The wizard will auto-generate and save these environment variables to `.env`:
   - `KEYSTATIC_GITHUB_CLIENT_ID` - GitHub OAuth client ID
   - `KEYSTATIC_GITHUB_CLIENT_SECRET` - GitHub OAuth secret
   - `KEYSTATIC_SECRET` - Keystatic authentication secret
   - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` - GitHub App slug (public)

**.env is in `.gitignore` and should never be committed.**

### How Keystatic is Disabled in Production

The `astro.config.ts` conditionally includes Keystatic based on the `ENABLE_KEYSTATIC` environment variable:
- **Cloudflare Pages (no `.env`):** `ENABLE_KEYSTATIC` is undefined → Keystatic disabled → pure static build
- **Local dev (`.env` present):** `ENABLE_KEYSTATIC=true` → Keystatic enabled → dev server with admin UI

## Codespaces Setup

### Step 1: Add Secrets to GitHub
1. Go to repo Settings → Secrets and variables → Codespaces
2. Add the four environment variables from your local `.env` file:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET`
   - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

### Step 2: Start a Codespace
1. Click Code → Codespaces → Create codespace on main
2. Wait for the Codespace to initialize (the `.devcontainer.json` will auto-install dependencies)
3. Run: `pnpm dev`
4. The browser should auto-open the forwarded port; navigate to `/keystatic`
5. Sign in with GitHub — you're ready to edit content!

## Content Collections

Three collections are configured:

### Posts
- **Path:** `content/blog/{slug}/index.mdx`
- **Fields:** title, date, description, tags, draft status, content (MDX)
- **View:** `/posts` page

### Projects
- **Path:** `content/projects/{slug}/index.mdx`
- **Fields:** title, date, description, category (front-burner/back-burner/retired), tech stack, tagline, URLs, content (MDX)
- **View:** `/projects` page

### Work
- **Path:** `content/work/{slug}/index.mdx`
- **Fields:** title, date, description, image, URL, label, content (MDX)
- **View:** `/work` page

## How It Works

- **Local editing:** Changes made in Keystatic are committed directly to your repo via the GitHub API
- **No manual git:** You don't need to run `git` commands or edit MDX files directly
- **Build stays static:** `pnpm build` creates a static site; Keystatic routes only run during `pnpm dev`
- **Codespaces-friendly:** Works perfectly in GitHub Codespaces without VSCode

## Technical Details

- **Framework:** Astro 6.3.1
- **Adapter:** `@astrojs/node` (in middleware mode for local/Codespaces)
- **Output:** Static (routes pre-rendered, Keystatic SSR only on demand)
- **Storage:** GitHub (via Keystatic's GitHub integration)
- **Config files:**
  - `astro.config.ts` — Astro config with Keystatic integration
  - `keystatic.config.ts` — Keystatic collections and schema
  - `.devcontainer/devcontainer.json` — Codespaces environment

## Troubleshooting

**"Cannot use server-rendered pages without an adapter"**
- The `@astrojs/node` adapter is required for Keystatic's admin UI. It's already configured in `astro.config.ts`.

**Keystatic not loading at `/keystatic`**
- Ensure the dev server is running: `pnpm dev`
- Check that you're visiting `http://localhost:4321/keystatic` (exact URL matters)

**GitHub authentication fails**
- Verify env vars are set: `echo $KEYSTATIC_GITHUB_CLIENT_ID`
- The setup wizard must have completed successfully
- In Codespaces, check that Codespaces secrets were added to the repo

**Content not appearing on site**
- Rebuild and restart dev server: `pnpm dev`
- Ensure the collection directory exists (e.g., `content/blog/` for posts)
- Check that the slug field matches the directory name

## Further Reading

- [Keystatic Docs](https://keystatic.com/docs)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
