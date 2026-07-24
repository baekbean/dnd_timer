# Changelog

All notable changes to DnD Timer are documented here.

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
