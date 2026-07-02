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

interface WaitlistClickParams {
  button_location: 'nav' | 'hero' | 'cta'
  button_text: string
  page_path?: string
}

export function trackWaitlistClick(params: WaitlistClickParams) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'waitlist_click', {
    button_location: params.button_location,
    button_text: params.button_text,
    page_path: params.page_path ?? window.location.pathname,
  })
}
