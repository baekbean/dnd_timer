/**
 * Session-scoped gating for the mobile → desktop/iPad handoff bottom sheet.
 * Two separate flags:
 *
 * - "dismissed": set only by the actions the spec calls out (Continue on
 *   mobile / Close / Share success / Email success / Copy success). While
 *   unset, the sheet is allowed to reappear on a later mount within the
 *   same tab (e.g. a reload) — nothing here suppresses that.
 * - "viewed": set the first time the sheet actually renders, independent
 *   of "dismissed". Analytics view fires once per session, so a reload
 *   that reshows the sheet (because no dismissing action was taken yet)
 *   doesn't double-count `mobile_handoff_prompt_view`.
 *
 * sessionStorage can throw in some private-browsing contexts — every call
 * is wrapped so a storage failure just falls back to "always show / always
 * log," which is the safer failure mode for a non-blocking prompt.
 */

const DISMISSED_KEY = 'dnd-handoff-dismissed'
const VIEWED_KEY = 'dnd-handoff-viewed'

function readFlag(key: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeFlag(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(key, '1')
  } catch {
    // Ignore — worst case the sheet can reappear this session.
  }
}

export function hasHandoffBeenDismissed(): boolean {
  return readFlag(DISMISSED_KEY)
}

export function markHandoffDismissed(): void {
  writeFlag(DISMISSED_KEY)
}

export function hasHandoffBeenViewed(): boolean {
  return readFlag(VIEWED_KEY)
}

export function markHandoffViewed(): void {
  writeFlag(VIEWED_KEY)
}
