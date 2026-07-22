# Changelog

All notable changes to DnD Timer are documented here.

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
