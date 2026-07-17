import { detectDeviceType } from '@/lib/deviceType'

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer: unknown[]
  }
}

function gtagEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  const payload = { page_path: window.location.pathname, ...params }

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payload)
    return
  }

  // gtag not ready yet (afterInteractive race) — retry every 250ms, up to 5s
  let attempts = 0
  const timer = setInterval(() => {
    if (typeof window.gtag === 'function') {
      clearInterval(timer)
      window.gtag('event', name, payload)
    } else if (++attempts >= 20) {
      clearInterval(timer)
    }
  }, 250)
}

// ── waitlist_click ──────────────────────────────────────────────
interface WaitlistClickParams {
  button_location: 'nav' | 'hero' | 'cta'
  button_text: string
  page_path?: string
}

export function trackWaitlistClick(params: WaitlistClickParams) {
  gtagEvent('waitlist_click', {
    button_location: params.button_location,
    button_text: params.button_text,
    ...(params.page_path ? { page_path: params.page_path } : {}),
  })
}

// ── section_view ────────────────────────────────────────────────
export type SectionName = 'hero' | 'features' | 'workspace_images' | 'cta'

export function trackSectionView(section_name: SectionName) {
  gtagEvent('section_view', { section_name })
}

// ── timer product events (see PLAN.md success metrics) ──────────
type TimerPhase = 'focus' | 'shortBreak'

export function trackTimerStart(params: { phase: TimerPhase; scene_id: string; focus_min: number }) {
  gtagEvent('timer_start', params)
}

/** The +N min quick-extend button was used mid-focus-session. */
export function trackFocusExtend(params: { minutes: number }) {
  gtagEvent('focus_extend', params)
}

/**
 * Fires as `focus_complete` or `break_complete` depending on which phase just
 * finished naturally, so GA4 can compare against `timer_start` by event name
 * alone — no `completed_phase` parameter filter needed in reports.
 */
export function trackSessionComplete(params: { completed_phase: TimerPhase; sessions_today: number }) {
  const eventName = params.completed_phase === 'focus' ? 'focus_complete' : 'break_complete'
  gtagEvent(eventName, params)
}

/** A running/paused focus session was cut short by reset or skip. */
export function trackSessionAbandon(params: { via: 'reset' | 'skip'; remaining_ms: number }) {
  gtagEvent('session_abandon', params)
}

export function trackSceneChange(params: { scene_id: string }) {
  gtagEvent('scene_change', params)
}

export function trackFullscreenEnter() {
  gtagEvent('fullscreen_enter', {})
}

/** The mute/unmute pill was toggled — captures user intent, not just ambient start/stop. */
export function trackSoundToggle(params: { sound_on: boolean }) {
  gtagEvent('sound_change', params)
}

// ── 404_hit ─────────────────────────────────────────────────────
/** Fired from the not-found page so broken/stale links show up as diagnosable data instead of a dead end. */
export function trackNotFound(params: { attempted_path: string; referrer: string }) {
  gtagEvent('404_hit', params)
}

// ── feedback flow ───────────────────────────────────────────────
/** "Send feedback" was clicked, revealing the inline form — funnel start. */
export function trackFeedbackClick(params: { button_location: string; page?: string }) {
  gtagEvent('feedback_click', params)
}

/** The feedback form was actually submitted — funnel end. */
export function trackFeedbackSubmit(params: { page?: string }) {
  gtagEvent('feedback_submit', params)
}

// ── mobile → desktop/iPad handoff ───────────────────────────────
/** Lightweight UA sniff — no browser-detection utility exists elsewhere in the codebase. */
function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\//.test(ua)) return 'Opera'
  if (/SamsungBrowser/.test(ua)) return 'Samsung Internet'
  if (/CriOS/.test(ua)) return 'Chrome iOS'
  if (/FxiOS/.test(ua)) return 'Firefox iOS'
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari'
  return 'unknown'
}

function getHandoffContext(): Record<string, string> {
  const params =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  return {
    device_type: detectDeviceType(),
    browser: detectBrowser(),
    referrer: typeof document !== 'undefined' ? document.referrer || '(none)' : '(none)',
    utm_source: params?.get('utm_source') ?? '(none)',
    utm_medium: params?.get('utm_medium') ?? '(none)',
  }
}

/** Sheet rendered on screen. Fires once per session — see lib/timer/handoffSession.ts. */
export function trackMobileHandoffView() {
  gtagEvent('mobile_handoff_prompt_view', getHandoffContext())
}

/** Closed via the X button or a backdrop tap — no explicit choice made. */
export function trackMobileHandoffDismiss(params: { method: 'close_button' | 'backdrop' }) {
  gtagEvent('mobile_handoff_prompt_dismiss', { ...getHandoffContext(), ...params })
}

/** "Continue on mobile" — explicit opt-out of switching devices. */
export function trackMobileHandoffContinue() {
  gtagEvent('mobile_handoff_continue', getHandoffContext())
}

/**
 * Primary CTA completed — either the native share sheet was actually
 * shared through, or (Web Share API unsupported) the link was copied as
 * the automatic fallback. Fires only on real completion, never on cancel.
 */
export function trackMobileHandoffShare() {
  gtagEvent('mobile_handoff_share', getHandoffContext())
}

/** Secondary CTA clicked — email input UI revealed. */
export function trackMobileHandoffEmailOpen() {
  gtagEvent('mobile_handoff_email_open', getHandoffContext())
}

/** Address logged and the mail-app compose window opened — our closest observable point to "sent". */
export function trackMobileHandoffEmailSubmit() {
  gtagEvent('mobile_handoff_email_submit', getHandoffContext())
}

/** Tertiary "Copy link" — fires only once the clipboard write resolves. */
export function trackMobileHandoffCopy() {
  gtagEvent('mobile_handoff_copy', getHandoffContext())
}
