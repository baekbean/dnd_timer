# TODOS

## SEO

### Consolidate app/layout.tsx metadata onto lib/seo constants

**What:** Import `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION`, `SITE_NAME` from `lib/seo` in `app/layout.tsx` (metadataBase, title.default, description, openGraph fields) and add a metadata-sync test.

**Why:** The layout still hardcodes the same strings `lib/seo.ts` centralizes. `TimerApp` sets `document.title` from `SITE_TITLE`, so editing either copy alone makes the tab title visibly mutate on first interaction — the same drift class that shipped the stale "Do Not Disturb Timer" branding.

**Context:** Deliberately deferred from the v0.0.1.4 ship because `app/layout.tsx` was being rewritten concurrently by the Reshaped design-system work; touching it mid-flight guaranteed a merge conflict. Do this once that work lands. `app/robots.ts`, `app/sitemap.ts`, and `app/about/page.tsx` already use the constants.

**Effort:** S
**Priority:** P1
**Depends on:** Reshaped layout work landing

### Move the home page h1/SEO section inside the main landmark

**What:** Restructure `app/page.tsx` so `SeoContent`'s `<h1>` and content live inside the page's `<main>` landmark (TimerApp currently renders its own `<main>` and SeoContent is a sibling `<section>`).

**Why:** Screen-reader "jump to main content" skips the entire SEO section, and the page's only h1 sits outside the main landmark — an accessibility and document-outline defect flagged by adversarial review.

**Context:** Requires changing TimerApp's root element (`<main>` → `<div>`) and wrapping both children in one `<main>` in `app/page.tsx`. Deferred from v0.0.1.4 because TimerApp was under concurrent edit by the sound/Reshaped work.

**Effort:** S
**Priority:** P2
**Depends on:** Sound/Reshaped TimerApp work landing

### Strengthen SEO copy once ambient sounds and custom scenes ship

**What:** Re-add rain/birdsong ambience and bring-your-own-YouTube-scene claims to `lib/seo.ts` FAQ items and `SeoContent` feature copy, and bump the sitemap dates.

**Why:** The v0.0.1.4 copy deliberately claims only live features (production ambient is a synthesized placeholder; custom scenes are unreleased). Once the sound/YouTube feature deploys, richer copy targets stronger long-tail keywords ("rain sounds focus timer").

**Context:** The original stronger copy exists in the v0.0.1.4 branch history (`bc022f1`, reworded in `c7b6c9e`). One-line-per-claim restoration plus FAQ wording.

**Effort:** S
**Priority:** P2
**Depends on:** Sound panel + custom YouTube scene feature deploying to production

### og:image doesn't cascade to nested static routes

**What:** `/about` and `/updates/*` don't inherit `app/opengraph-image.jpg` as their `og:image` the way the Next.js metadata-file docs describe for a root-level static image — only `/` gets it. Investigate whether nested static/non-dynamic routes need explicit `openGraph.images` in their own metadata, or whether the convention genuinely doesn't cascade past the segment it's colocated with.

**Why:** Sharing an `/about` or `/updates/[slug]` link currently shows no preview image on social platforms — same missing-preview problem the root OG card was built to fix.

**Context:** Found while verifying the new `/updates` pages (built in this session) — confirmed pre-existing on the live `/about` page too, not something the Updates feature introduced.

**Effort:** S
**Priority:** P2
**Depends on:** None

## Completed
