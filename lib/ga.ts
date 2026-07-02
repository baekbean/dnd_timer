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
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, { page_path: window.location.pathname, ...params })
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
