# TODOS

## Testing

### Fix order-dependent flake in TimerAppSoundScene.test.tsx

**What:** `it('ducks the video under the chime on a natural completion for the custom video scene')` in `__tests__/TimerAppSoundScene.test.tsx` fails under randomized test order (`npx vitest run __tests__/TimerAppSoundScene.test.tsx --sequence.shuffle --sequence.seed=3`) — `mockControls.duck` is never called when this test runs after certain others in the file.

**Why:** A test whose pass/fail depends on execution order is a hidden trust gap — it can start failing in CI (or after adding/reordering tests) with no code change to blame.

**Context:** Found by the testing specialist during `/ship`'s pre-landing review on 2026-08-01, while adding new tests to this same file for the mute-icon feature. Reproduced identically on the pre-existing (unmodified) version of the file, so this is not something the mute-icon branch introduced — likely shared mutable state (the Zustand store, or the `mockControls`/`completions` fields) leaking between tests without a full reset. Default (non-shuffled) `npm test` order passes cleanly; only surfaces under `--sequence.shuffle`.

**Effort:** S
**Priority:** P3
**Depends on:** None

## Timer app

### Fix stale getScene() in the experimental /timer-test2 route

**What:** `components/timer-test2/TimerAppYoutube.tsx:292` resolves the active scene with `getScene(sceneId)` instead of `resolveScene(sceneId, customYoutubeId)`.

**Why:** `getScene` alone silently falls back to `SCENES[0]` for the custom scene id — picking the custom video tile in this route reverts to the default scene instead of showing the custom video.

**Context:** Noticed by `/ship`'s pre-landing review on 2026-07-30. Pre-existing (not introduced by the Reshaped-migration branch), and scoped to `/timer-test2`, an experimental comparison route not linked from the shipped app — no production impact. The production route (`ScenePicker.tsx` → `TimerApp.tsx`) already uses `resolveScene` correctly.

**Effort:** S
**Priority:** P2
**Depends on:** None

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
