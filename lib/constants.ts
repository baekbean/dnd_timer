export const GOOGLE_FORM_BASE_URL: string =
  'https://docs.google.com/forms/d/e/1FAIpQLSeyyyWhrM3YwIFJ0GYK6b1fJ5y0v1z_koY3pT-uh3eVkkoTpA/viewform'

export const GOOGLE_FORM_EMAIL_ENTRY: string = 'entry.2005620554'

export function buildFormUrl(email: string): string {
  if (!GOOGLE_FORM_BASE_URL || GOOGLE_FORM_BASE_URL === '#') return '#'
  if (!GOOGLE_FORM_EMAIL_ENTRY) return GOOGLE_FORM_BASE_URL
  return `${GOOGLE_FORM_BASE_URL}?usp=pp_url&${GOOGLE_FORM_EMAIL_ENTRY}=${encodeURIComponent(email)}`
}
