# Changelog

All notable changes to NookTimer (formerly DnD Timer) are documented here.

## [0.0.1.7] - 2026-07-31

### Changed
- The site header and footer (shared by About and Updates) now match the current Figma design: a "NookTimer" wordmark image replaces the old logo graphic, the nav button reads "Start focusing" and links straight into the timer instead of opening the waitlist form, and the footer's copyright and social links were tidied up (TikTok now points at the current account, Discord dropped, "Contact us" renamed to "Mail").
- The Updates blog pages are back on the same shared header/footer as the rest of the site, instead of the bare minimal header they briefly had.
- Removed the first Updates post (the SEO/discoverability writeup) and rewrote the remaining post's title and copy.

### For contributors
- Added a `start_focusing_click` analytics event (GA4 + PostHog) for the nav CTA, replacing the `join_waitlist`/`waitlist_click` tracking that button used to fire — see `EVENTS.md`.

## [0.0.1.6] - 2026-07-30

### Added
- Set your own background video: paste a YouTube link and it plays behind the timer, with its own volume control right alongside the ambient sounds.
- Ambient sound presets (Rain, Birds, Garden crickets, Night bugs) now play real recordings instead of a synthesized placeholder — White and Brown noise stay synthesized.
- The Sound panel has a video-player-style volume control: click the speaker to mute, drag the slider to adjust — no separate on/off switch needed.

### Changed
- The whole app's look moved onto the Reshaped design system — switches, sliders, modals, popovers, and buttons now use Reshaped's own components instead of hand-rolled equivalents, with NookTimer's brand colors layered on top.
- The Settings and Sound panels now have matching section subtitles ("Volume", "Sound type", etc.) so it's clear what each control group does.

### Fixed
- Opening the background-video editor no longer jumps the whole page to the bottom — the link input used to auto-focus in a way that triggered an unrelated browser scroll.
- A mid-duck volume change (adjusting the slider right as a session-end chime plays) no longer gets silently overwritten a couple seconds later.
- Switching ambient presets no longer leaves disconnected audio nodes behind; a stalled ambient-sound download now falls back to a synthesized bed instead of playing nothing.

### For contributors
- Added `EVENTS.md`, a catalog of every analytics event this app fires — what triggers it, its parameters, and where it's called from.
- Closed a few pre-existing analytics gaps: duration-preset clicks and settings-toggle changes are now tracked, and a custom-background reset is now distinguishable from a genuinely custom URL.

## [0.0.1.5] - 2026-07-30

### Added
- You can now keep your own visits out of analytics: open any page with `?internal=1` (and `?internal=0` to undo). The choice is remembered per browser, so it keeps excluding you even after your home IP changes — the usual reason IP-based internal-traffic filters quietly stop working. It opts that browser out of PostHog entirely and tags every Google Analytics hit as internal traffic (`traffic_type=internal`) so the GA4 internal-traffic filter drops it, independent of IP.

## [0.0.1.4] - 2026-07-30

### Added
- The home page now tells search engines (and anyone who scrolls past the timer) what NookTimer is: a server-rendered section with the product story, how-to steps, and an FAQ. Previously crawlers saw an almost empty page.
- Structured data (WebApplication + FAQPage JSON-LD) so Google can show rich results, generated from the same FAQ text visitors see.
- Sharing nooktimer.com now shows a proper preview card: a 1200×630 image of the timer digits over the Dusk scene's gradient (optimized to 106KB so every platform renders it).
- The About page has its own title, description, and complete social metadata (including site name and type) instead of inheriting the home page's.

### Changed
- The browser tab now says "NookTimer – Focus Timer for Your Space" — the old "Do Not Disturb Timer" branding is gone from the idle and running tab titles.
- SEO copy describes only what's live today (the ambient sound layer), not upcoming features, so search visitors find exactly what the page promises.
- The tab title, sitemap, robots, manifest, and About page URLs now come from one shared module (`lib/seo`), ending the drift that left the old brand name in the tab title (the root layout's copies are consolidated in a follow-up).
- SEO section body text bumped to 16px for readability.

### Fixed
- The installable app (PWA) manifest served at `/manifest.webmanifest` still carried the old "Do Not Disturb Timer" name and green theme color — now NookTimer with the dark theme, matching the rest of the brand.
- Sitemap dates now reflect when the pages actually changed.

### For contributors
- Test suite now covers the new SEO surfaces: tab-title branding, page composition (one h1, two JSON-LD scripts), FAQ/markup parity, and the share-card size budget.

## [0.0.1.3] - 2026-07-24

### Added
- Analytics now track how long each scene is on screen (`scene_exposure` event with `scene_id`, `duration_ms`, and `ended_reason`). This makes it possible to measure which scenes users actually spend time with, including the default scene — previously untrackable because it never receives a "switch to" event.
- Timer sessions abandoned by closing or navigating away are now captured as `session_abandon` with `via: tab_closed`. Previously, sessions that ended without pressing Reset or Skip produced no exit signal in analytics.
- Sitemap (`/sitemap.xml`) and improved `robots.txt` with sitemap reference for Google Search Console indexing.

### Changed
- Site title updated to "NookTimer – Focus Timer for Your Space" with per-page title templating (`%s | NookTimer` for inner pages).
- Site description, Open Graph, and Twitter Card metadata updated with keyword-rich copy targeting focus timer, study timer, and ambient timer searches.
- App icon replaced across all surfaces (favicon, Apple touch icon, PWA icons) with the new NookTimer brand mark.
- PWA manifest updated: app name changed from "Do Not Disturb Timer" to "NookTimer".

### Fixed
- Homepage `<title>` was stuck on "Do Not Disturb Timer" because `app/page.tsx` had a stale `metadata` export overriding the layout's `title.default`. Removed to let the layout default take effect.
- iOS landscape mode safe areas (left/right bars) now render dark instead of the previous off-white (`#F6F6F3`). The `html` and `body` backgrounds are now dark; the `/about` landing page retains its light background via an explicit class.
- Footer "Try the timer" link replaced `<a href="/">` with Next.js `<Link>` to fix `@next/next/no-html-link-for-pages` lint error.

## [0.0.1.2] - 2026-07-22

### Added
- Mobile landscape support: rotating your phone to landscape now compresses the timer layout to fit the shorter viewport. The timer font scales down to stay within the screen height, control buttons shrink, spacing tightens, and the handoff sheet hides until you rotate back to portrait. Rotating in either direction updates the layout immediately.

## [0.0.1.1] - 2026-07-21

### Fixed
- Resolved React hydration error #418 on Chrome/Android. The fullscreen support check was running inside a `useState` initializer, which produced different values on the server (no fullscreen API) versus the client (fullscreen API present), causing the rendered HTML to mismatch and React to fall back to a full client re-render. The check now runs in a `useEffect` after mount so both server and client start with the same initial state.

## [0.0.1.0] - 2026-07-20

### Changed
- Mobile handoff sheet now appears on every mobile visit instead of just once per session. Users can suppress it for the rest of the calendar day with "Don't show again today," and the sheet comes back automatically at midnight. Plain closes (X, backdrop, Continue on mobile) bring it back on the next page load.
- Updated handoff sheet copy: title is now "Looks even better on a bigger screen"; body is more welcoming and ends with an emoji.
- Removed the standalone "Copy link" button from the handoff sheet — the primary "Send to another device" button already falls back to clipboard copy when Web Share API is unavailable.
- "Continue on mobile" moved above "Don't show again today" to make the primary exit action more prominent.

### Added
- Vitest test suite with @testing-library/react. All handoff session gating logic and MobileHandoffSheet interactions (14 tests) are now covered.
- GitHub Actions CI workflow runs the test suite on every push and pull request.
