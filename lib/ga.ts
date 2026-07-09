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

export function trackSessionComplete(params: { completed_phase: TimerPhase; sessions_today: number }) {
  gtagEvent('session_complete', params)
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
