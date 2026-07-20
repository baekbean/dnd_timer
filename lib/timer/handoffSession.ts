/**
 * Gating for the mobile → desktop/iPad handoff bottom sheet. Two flags:
 *
 * - "hidden today" (localStorage, date-stamped): set only by the explicit
 *   "Don't show again today" button. Every other way of closing the sheet
 *   (X, backdrop, Continue on mobile, share/email completion) is
 *   view-local — the sheet comes back on the next page load until the
 *   person opts out for the day.
 * - "viewed" (sessionStorage): set the first time the sheet actually
 *   renders. Analytics view fires once per session, so reloads that
 *   reshow the sheet don't double-count `mobile_handoff_prompt_view`.
 *
 * Storage can throw in some private-browsing contexts — every call is
 * wrapped so a failure just falls back to "always show / always log,"
 * which is the safer failure mode for a non-blocking prompt.
 */

export const HANDOFF_HIDE_DATE_KEY = 'dnd-handoff-hide-date'
const VIEWED_KEY = 'dnd-handoff-viewed'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function isHandoffHiddenToday(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(HANDOFF_HIDE_DATE_KEY) === todayKey()
  } catch {
    return false
  }
}

export function markHandoffHiddenToday(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(HANDOFF_HIDE_DATE_KEY, todayKey())
  } catch {
    // Ignore — worst case the sheet reappears.
  }
}

export function hasHandoffBeenViewed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(VIEWED_KEY) === '1'
  } catch {
    return false
  }
}

export function markHandoffViewed(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(VIEWED_KEY, '1')
  } catch {
    // Ignore — worst case the view event double-counts.
  }
}
