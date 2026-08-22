# Analytics event catalog

Single source of truth for every tracked interaction in this app: what fires it, with what params, and where. Read this before adding a new event so you don't duplicate one that already exists, and update it in the same change whenever you add, rename, or change the params of an event.

## How tracking works here

Three destinations:

- **GA4**, via a `trackX(params)` function in `lib/ga.ts`. Each one calls the shared `gtagEvent(name, params)` helper, which retries for 5s if `gtag` hasn't loaded yet (`afterInteractive` race) and auto-injects `page_path`.
- **PostHog**, via `posthog.capture('event_name', params)` called directly at the same call site — there is no shared wrapper for this one.
- **Vercel Analytics**, available via `track('event_name', params)` from `@vercel/analytics`; the current product CTAs use the GA4 and PostHog paths below.

**Convention for a new tracked interaction:**
1. Add a `trackX(params)` function to `lib/ga.ts` in the relevant `// ── section ──` block, with a one-line comment above it saying when it fires.
2. At the call site, call `trackX(params)` and `posthog.capture('event_name', params)` together, with matching params.
3. Add a row for it below.
4. Add a test asserting it fires — and, if it's gated by a condition, asserting it does *not* fire on the other side of that condition (see `SettingsPanel.test.tsx`'s Notify-permission test for an example).

## Timer app

### Timer core (`components/timer/TimerApp.tsx`, `ScenePicker.tsx`)

| Event | Fires when | Params | Where |
|---|---|---|---|
| `timer_start` | A focus/break session starts | `phase`, `scene_id`, `focus_min` | TimerApp.tsx |
| `focus_extend` | The +N min quick-extend button is used mid-focus | `minutes` | TimerApp.tsx |
| `focus_complete` / `break_complete` | A phase finishes naturally (event name depends on which) | `completed_phase`, `sessions_today` | TimerApp.tsx |
| `session_abandon` | A running/paused focus session is cut short | `via` (`reset`\|`skip`\|`tab_closed`), `remaining_ms`, `scene_id` | TimerApp.tsx (reset/skip, and the `pagehide` handler for tab close) |
| `scene_change` | The background scene is switched | `scene_id` | ScenePicker.tsx |
| `scene_exposure` | The *outgoing* scene's on-screen time is logged, right before switching or on tab close — this is what makes the default scene's usage measurable, since nothing ever "switches to" it | `scene_id`, `duration_ms`, `ended_reason` (`switched`\|`tab_closed`) | ScenePicker.tsx, TimerApp.tsx |

### Custom YouTube background (`ScenePicker.tsx`, `CustomScenePopover.tsx`, `TimerApp.tsx`)

| Event | Fires when | Params | Where |
|---|---|---|---|
| `custom_scene_editor_open` | The link editor is opened — funnel start | – | ScenePicker.tsx |
| `custom_scene_set` | A link is accepted and becomes the custom background, including resetting back to the shipped default (same call path) | `video_id`, `is_default` | ScenePicker.tsx |
| `custom_scene_invalid_url` | A pasted link couldn't be parsed | – | ScenePicker.tsx |
| `custom_scene_error` | The player rejected the video (2/5 = player error, 100 = gone, 101/150 = embedding disabled) | `code` | TimerApp.tsx |
| `custom_scene_ready` | The embed successfully loaded and started playing | `video_id` | TimerApp.tsx |
| `custom_scene_unmute_blocked` | The browser wouldn't unmute the embed (iOS fallback path) | – | TimerApp.tsx |
| `fullscreen_enter` | Fullscreen is toggled on | – | TimerApp.tsx |

### Sound panel (`SoundPanel.tsx`)

| Event | Fires when | Params | Where |
|---|---|---|---|
| `sound_change` | Sound is muted/unmuted — via the speaker button, dragging the volume slider to/from 0%, or the 'm' keyboard shortcut | `sound_on`, `source` (`button`\|`slider`\|`keyboard`) | SoundPanel.tsx, TimerApp.tsx |
| `custom_scene_sound_source` | The Ambient/Video source toggle is switched (custom YouTube scene only) | `source` (`app`\|`video`) | SoundPanel.tsx |
| `ambient_preset_change` | A different ambient noise preset is picked | `preset` (`white`\|`brown`\|`rain`\|`birds`\|`gardenCrickets`\|`nightBugs`) | SoundPanel.tsx |

### Settings panel (`SettingsPanel.tsx`, `SeoFeedbackLink.tsx`)

| Event | Fires when | Params | Where |
|---|---|---|---|
| `duration_preset_click` | A Focus/Break/Sessions shortcut chip is clicked (not manual typing) | `field` (`focus`\|`break`\|`sessions`), `value` | SettingsPanel.tsx |
| `settings_toggle_change` | An Auto-start/Notify switch is flipped — for Notify, only once the permission gate actually lets the change through | `field` (`auto_start_breaks`\|`auto_start_focus`\|`notify_on_complete`), `value` | SettingsPanel.tsx |
| `settings_saved` | The settings modal is closed with pending duration changes | dynamic patch of changed fields, `apply_mode`? | SettingsPanel.tsx |
| `feedback_click` | "Send feedback" is clicked, revealing the inline form (or, for `UpdatesFeedbackLink`/`BlogFeedbackLink`, opening the feedback form directly) | `button_location`, `page`? (`updates`\|`blog`\|…) | SettingsPanel.tsx, SeoFeedbackLink.tsx, components/timer/UpdatesFeedbackLink.tsx, components/blog/BlogFeedbackLink.tsx |
| `feedback_submit` | The feedback form is actually submitted | `page`? | SettingsPanel.tsx |

### Mobile → desktop/iPad handoff (`MobileHandoffSheet.tsx`)

All of these auto-inject a context blob (`device_type`, `browser`, `referrer`, `utm_source`, `utm_medium`) via `getHandoffContext()`.

| Event | Fires when | Extra params | Where |
|---|---|---|---|
| `mobile_handoff_prompt_view` | The sheet is rendered (once per session) | – | MobileHandoffSheet.tsx |
| `mobile_handoff_prompt_dismiss` | Closed via the X button or a backdrop tap | `method` (`close_button`\|`backdrop`) | MobileHandoffSheet.tsx |
| `mobile_handoff_continue` | "Continue on mobile" — explicit opt-out | – | MobileHandoffSheet.tsx |
| `mobile_handoff_share` | The share sheet completed, or the link was copied (Web Share unsupported, or native share failed for a non-cancel reason) | `method` (`share_api`\|`copy_fallback`) | MobileHandoffSheet.tsx |
| `mobile_handoff_email_open` | Secondary CTA clicked, revealing the email input | – | MobileHandoffSheet.tsx |
| `mobile_handoff_email_submit` | Mail-app compose window opened (closest observable point to "sent") | – | MobileHandoffSheet.tsx |
| `mobile_handoff_hide_today` | "Don't show again today" — the only action that suppresses the sheet across visits | – | MobileHandoffSheet.tsx |

### Desktop/iPad onboarding (`DesktopOnboardingSnackbar.tsx`, `DesktopOnboardingModal.tsx`, `TimerApp.tsx`)

Same `getHandoffContext()` blob auto-injected on all of these.

| Event | Fires when | Extra params | Where |
|---|---|---|---|
| `desktop_onboarding_prompt_view` | The snackbar is shown | – | TimerApp.tsx |
| `desktop_onboarding_prompt_dismiss` | Closed — button, outside click, escape, or auto-dismiss | `method` | DesktopOnboardingSnackbar.tsx |
| `desktop_onboarding_install` | The native install prompt resolved | `outcome` (`accepted`\|`dismissed`) | DesktopOnboardingSnackbar.tsx |
| `desktop_onboarding_modal_open` | The "Add to Home Screen" instructions modal opened | – | DesktopOnboardingSnackbar.tsx |
| `desktop_onboarding_share_click` | Share CTA clicked inside that modal | – | DesktopOnboardingModal.tsx |
| `desktop_onboarding_share_outcome` | The share sheet resolved | `outcome` (`shared`\|`cancelled`) | DesktopOnboardingModal.tsx |

### Misc

| Event | Fires when | Params | Where |
|---|---|---|---|
| `404_hit` | The not-found page renders — so broken/stale links are diagnosable instead of a dead end | `attempted_path`, `referrer` | app/not-found.tsx |

## Marketing landing page

| Event | Fires when | Params | Destinations | Where |
|---|---|---|---|---|---|
| `start_focusing_click` | A "Start focusing" CTA is clicked, linking straight to `/` | `button_location` (`nav`\|`about_hero`\|`about_cta`\|`blog_post_callout`\|`blog_post_end_cta`) | GA4 + PostHog | Nav.tsx, Hero.tsx, Section3.tsx, components/blog/BlogCallout.tsx, components/blog/BlogEndCta.tsx |
| `section_view` | A landing-page section scrolls into view (fires once per session) | `section_name` (`hero`\|`features`\|`workspace_images`\|`cta`) | GA4 | SectionTracker.tsx |

## Experimental routes

`/timer-test` and `/timer-test2` (`TimerAppFeather.tsx`, `TimerAppYoutube.tsx`, `ScenePickerFeather.tsx`) are alternate UI experiments that fire the same canonical events listed above from analogous locations — not separately cataloged here. If one of these routes ships for real, fold its call sites into the tables above instead of duplicating them.
