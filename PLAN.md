# Desirable Focus Timer — Product Plan

> Source of truth for product direction: [One-pager (Notion)](https://app.notion.com/p/One-pager-Desirable-Focus-Timer-38872054c899803196b7f0b3c8e25a50)
> Landing page (`/`) stays as-is; the product lives at `/timer` until stable, then swaps to `/`.

## Product definition

A **digital focus object** — not a productivity app. A focus timer beautiful enough
to live on your screen (and on a StudyTok / Study With Me camera) all day.

**Principles (from one-pager):**

1. **Digital Object** — calm, beautiful, always present. Never a dashboard.
2. **Instant Start** — open and start immediately. Default mode, background, sound,
   and session length are pre-selected. Zero setup friction.

**Target:** people who romanticize productivity — StudyTok creators, Study With Me
viewers, desk-setup curators, "aesthetic study timer" searchers.

**Platforms:** Desktop Web + iPad (equal first-class). Mobile later.

## MVP scope (v1)

Core loop: open → (instantly) start → Focus 25min → chime → Break → … → Complete screen.

1. **Timer core** — Focus / short break / long break cycle, session counter,
   start·pause·reset·skip. Timestamp-based math (accurate in background tabs).
   Session lengths editable only inside Settings (defaults: 25/5/15, long break every 4).
2. **Scenes (backgrounds)** — one signature looping video scene + 2–3 alternates.
   webm/mp4 dual source like the landing hero. Scenes defined as data objects so
   adding one requires no code changes. *(Assets: self-produced; dummy placeholders until then.)*
3. **Sound** — one ambient loop per scene, volume/mute, session-transition chime. No mixer.
4. **Camera-ready screen** — UI fades out completely when idle (timer only),
   fullscreen toggle, Wake Lock, big high-contrast digits. The landing hero mockup is the spec.
5. **Complete screen** — quiet, beautiful session-end moment (only "Nth session today").
   The one place designed to be screenshot-worthy (organic share is a target metric).
6. **Settings overlay** — session lengths, auto-start, notifications, sound. Nothing more.
7. **PWA** — manifest, installable on iPad/desktop. Verify Wake Lock + audio autoplay
   constraints on a real iPad (iOS Safari).
8. **Analytics (stats without UI)** — anonymous localStorage id → GA4 events:
   `timer_start`, `session_complete`, `session_abandon`, `scene_change`,
   `fullscreen_enter`, return visits. Events must answer the one-pager metrics directly.

**Out of scope (v1, per one-pager):** account system, statistics dashboard,
social features, mobile-specific UI, payments.

## Technical direction

- Same repo, client-side only, no server/DB. Next.js 16 App Router
  (read `node_modules/next/dist/docs/` before coding — breaking changes vs training data).
- Timer state machine in a single store (Zustand + persist for settings & daily count).
- Instant Start = performance budget: poster image first, video lazy, audio preloaded
  after first interaction.
- Top risk list: iPad Safari — Wake Lock (iOS 16.4+), no unmuted audio autoplay
  (start on first tap), fullscreen API limits. Verify on device during M2.

## Milestones

| Stage | Contents | Done when |
|---|---|---|
| M1 | Timer core + state machine + settings persistence | Accurate cycles through refresh/background |
| M2 | Signature scene + sound + fullscreen/Wake Lock + iPad device check | Hero mockup works for real; iPad screen stays on |
| M3 | Instant Start polish + UI auto-hide + Complete screen + alternate scenes | "Focusing within 3s of open"; all-day quality |
| M4 | PWA + analytics events + QA + "Try it" link on landing | Shippable to the 300-person waitlist |

## Success metrics (post-launch, from one-pager)

- D7 retention ≥ 30% · Session completion ≥ 60% · Weekly active sessions/user ≥ 3 · Organic share ≥ 10%

## Open items

- Signature scene asset production (self-produced; dummy assets in the meantime).
