# illo.fyi v2 — design spec

Status: approved 2026-10-03. Visual reference: the r4 mockup (landing + `/projects/calca`).

## Goals

- One source of truth per project; adding a project is one file (`pnpm works:new`).
- Landing page carries most of the content: hero, upstream OSS, the full work index, latest log.
- Listings are CTA-first (name links straight to the project's site, docs, download or GitHub); `/projects/[id]` pages stay short for SEO and deliberate visits.
- Builds read only committed fixtures; no network at build time.

## Information architecture

| Route | Content |
| --- | --- |
| `/` | Hero, Upstream, Work, Log (latest 4), footer |
| `/projects/[id]` | Short project page (one per non-draft work) |
| `/log` | All log entries (posts + notes), newest first, grouped by year |
| `/log/[id]` | Long-form post + Giscus |
| `/about` | Bio + experience (unchanged content) |
| `/rss.xml`, `/llms.txt`, `/llms-full.txt`, `/about.md` | Generated from `posts`, `notes`, `works` |

Redirects (`public/_redirects`, Cloudflare Pages, 301): `/posts` → `/log`, `/posts/*` → `/log/:splat`, `/projects` → `/#work`, `/work` → `/about`.
No separate projects index: the landing already holds the full index. Revisit when the chip-board filter lands or works exceed ~40.

Nav: floating glass pill (current site style) on every breakpoint: Home, Log, About icons (Phosphor) + coral orb theme toggle. No bar, no border, no sidebar, no marquee.

## Content model

### `works` (`content/works/<id>/index.md`)

Opt-in: a project appears only if it has a file. `<id>` is the URL slug (`/projects/<id>`); existing ids (calca, clar, intl-ai, ...) are kept.

```yaml
name: Calca
summary: Describe a design in plain English, get polished HTML/CSS variations on an infinite canvas.  # one line, used in rows
status: building        # building | live | maintained | archived (owner-authored, never inferred)
scale: product          # product | tool | model | experiment
since: 2026-03-20       # optional; falls back to repo createdAt
primary: { label: Download, url: https://calca.illo.fyi }   # label: Visit | Try | Download | Docs | Install | Source
repo: espetro/calca     # optional reference("repos"); private/manual projects omit it
labels: { surface: desktop, runtime: local-first, source: open }
stack: [Electrobun, React, Hono, TypeScript]
highlight: { order: 2, proof: v0.6.1 desktop app for macOS and Windows. }  # optional: ★ row, sorts first, shows proof
cover: ./cover.webp     # optional image()
links: [{ label: Landing, url: ... }]  # optional extra links
draft: false
```

Body: at most one paragraph + three bullets (rendered under "What it is"). Long-form goes to the log.

Fixed label vocabularies (zod enums, validated at build):

- `surface`: web, desktop, macos, ios, android, mobile, cli, library, extension, api, mcp, bot, model, course
- `runtime`: cloud, local-first, on-device, self-host, build-time, in-browser
- `source`: open, closed, private

Groups on the landing, in order: Products (`product`), Tools & libraries (`tool`), Models & ports (`model`), Experiments & hackathons (`experiment`).
Order within a group: highlighted (by `highlight.order`), then status (building, live, maintained, archived), then `since` desc.
Each group shows highlighted rows + up to 4 more; the rest collapse into `<details>` "N more …".

### `repos` (cache, `src/data/repos.json`)

`pnpm refresh:repos` lists public repos of `GITHUB.USER` and every org in `GITHUB.ORGS` (`src/consts.ts`, initially `espetro` + `sigilco`), keeps `private === false` only, and fetches the latest release for repos referenced by a work. Uses `GITHUB_TOKEN` when set. Loaded as a content collection via `file()`; works point at it with `reference("repos")`.

```json
{ "generatedAt": "ISO", "repos": [{ "id": "espetro/calca", "description": "", "url": "", "homepage": "", "stars": 3, "language": "TypeScript", "license": "MIT", "topics": [], "createdAt": "", "pushedAt": "", "archived": false, "fork": false, "latestRelease": { "tag": "v0.6.1", "url": "", "publishedAt": "" } }] }
```

Private repos (e.g. Brioso) are never fetched; they are manual works without `repo`. `pnpm works:new <owner/repo | id>` scaffolds a work from the cache (or blank); `pnpm works:new --list` prints cached repos not yet showcased.

### `contributions` (cache, `src/data/contributions.json`)

`pnpm refresh:contributions`: public PRs by `espetro` outside own user/orgs (latest 30), merged or open (closed-unmerged dropped), plus repo stars.

```json
{ "generatedAt": "ISO", "prs": [{ "title": "", "url": "", "repo": "owner/name", "repoStars": 0, "state": "merged", "updatedAt": "" }] }
```

The weekly workflow (`.github/workflows/contributions.yml`) refreshes both caches with `GITHUB_TOKEN` and commits them.

### `posts` (`content/blog`, unchanged location and ids) and `notes` (`content/notes/*.md`)

Posts gain optional `project: reference("works")` and `featured: boolean`. Notes are short entries rendered inline on `/log` (anchor `#<id>`), no page: `{ date, project?, link? }` + markdown body.

## Landing sections

1. Hero: name with a coral full stop (easter-egg trigger), role, thesis, "Reach out" (mailto) + "or read the newsletter" text link. No availability line, no counts.
2. Upstream: PRs grouped by repo (avatar, repo, stars, up to 3 PRs with open/merged pills), 3 repos per page, autoplay 4 s, pauses on hover/focus, dots. All pages share one grid cell so the area is fixed (no layout bump). Reduced motion: all pages listed, no autoplay. "All on GitHub ↗".
3. Work: grouped rows. Row: ★ (if highlighted), name → `primary.url` ↗, status dot, summary, proof (highlighted only), labels line (surface · runtime · source), "details" → `/projects/<id>`.
4. Log: featured posts, then latest, 4 total; "All entries →" `/log`.
5. Footer: newsletter box, links (GitHub, LinkedIn, X, RSS, llms.txt), "Repo data cached YYYY-MM-DD". No "built with" line.

## Project page (`/projects/[id]`)

Back link "All work" → `/#work`; name + ★; status · scale · "Since Month YYYY"; summary as lede; CTA row (primary button with label + hostname, "Source" if repo); cover image; "What it is" (MDX body); "Facts" (Runs on, Stack, Source: repo · license · ★ stars or "Private"/"Closed source", Latest release); "In the log" (posts/notes with `project: <id>`, hidden when empty); prev/next work.

## Log and comments

- `/log/[id]` renders posts; ids equal current `content/blog` folder/file names and are immutable once published.
- Giscus on `/log/[id]` with `data-mapping="specific"`, `data-term=<post id>`, `data-strict="1"` (repo `espetro/espetro.github.io`, category "Blog posts"). Theme follows the site toggle (initial attribute + `postMessage` on toggle). No existing threads to migrate.

## Visual system

- Type: headings Host Grotesk (self-hosted via Fontsource); body/UI system stack `"Helvetica Neue", Helvetica, Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif`. Plus Jakarta Sans and Ndot are removed.
- Tokens: existing light/dark palette and coral accent; adds `--live`, `--live-soft`, `--glass-bg`, `--glass-border`, `--display`, `--text`.
- Status colors: building = accent, live = `--live`, maintained = `--muted-strong`, archived = `--muted`.
- Theme toggle: circular reveal from the orb via `document.startViewTransition` (instant under reduced motion or without support); the root view-transition override applies only during the toggle so `ClientRouter` navigation transitions are unaffected.
- Motion respects `prefers-reduced-motion`; all controls have visible focus rings.

## Easter egg: the back room

A drawer above the page (pushes content down) with "Design notes" (reveals per-section notes about where data comes from) and "Layout grid" (8 px baseline + column overlay) toggles, persisted in `localStorage`; Close button and Esc; `/#egg` opens it. Triggers: the coral full stop after the name (one-time hint bounce after 5 s) and a page-curl corner fixed top-right on every page.

## Analytics

PostHog with `cookieless_mode: "always"` and `person_profiles: "never"`; no cookie banner. `data-track` click capture stays. Not legal advice.

## Follow-ups (not in v1)

- Showcase design for highlighted work that isn't end-user facing (replacement for the dropped "Selected" cards).
- Chip-cloud / post-it board filter over labels (likely its own page).
- Build-time import of Substack / X posts into the log.
- Real proof lines and statuses review for every work (v1 seeds are drafts).
