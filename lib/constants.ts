const GOOGLE_FORM_ID = '1FAIpQLSeyyyWhrM3YwIFJ0GYK6b1fJ5y0v1z_koY3pT-uh3eVkkoTpA'

export const FEEDBACK_FORM_URL = 'https://forms.gle/8MznFbNymJ2JyhWA8'

export const GOOGLE_FORM_BASE_URL: string =
  `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/viewform`

const GOOGLE_FORM_SUBMIT_URL: string =
  `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`

export const GOOGLE_FORM_EMAIL_ENTRY: string = 'entry.2005620554'

export function buildFormUrl(email: string): string {
  if (!GOOGLE_FORM_BASE_URL || GOOGLE_FORM_BASE_URL === '#') return '#'
  if (!GOOGLE_FORM_EMAIL_ENTRY) return GOOGLE_FORM_BASE_URL
  return `${GOOGLE_FORM_BASE_URL}?usp=pp_url&${GOOGLE_FORM_EMAIL_ENTRY}=${encodeURIComponent(email)}`
}

export function submitEmailSilently(email: string): void {
  if (!email) return
  // The form collects responder emails ("응답자 입력"), which makes the extra
  // emailAddress param mandatory — without it formResponse rejects with 400.
  const body = new URLSearchParams({ [GOOGLE_FORM_EMAIL_ENTRY]: email, emailAddress: email })
  fetch(GOOGLE_FORM_SUBMIT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  }).catch(() => {})
}

// ── feedback form ────────────────────────────────────────────────
const FEEDBACK_FORM_ID = '1FAIpQLSeHdtwjctUiE2iILTAF1Vcle797r-dLv6jmNMAPCh4Nsk6qmg'
const FEEDBACK_TEXT_ENTRY = 'entry.356039200'

const FEEDBACK_FORM_SUBMIT_URL: string = FEEDBACK_FORM_ID
  ? `https://docs.google.com/forms/d/e/${FEEDBACK_FORM_ID}/formResponse`
  : ''

export function submitFeedbackSilently(text: string): void {
  if (!text || !FEEDBACK_FORM_SUBMIT_URL || !FEEDBACK_TEXT_ENTRY) return
  const body = new URLSearchParams({ [FEEDBACK_TEXT_ENTRY]: text })
  fetch(FEEDBACK_FORM_SUBMIT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  }).catch(() => {})
}
