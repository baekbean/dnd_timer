/**
 * Gating for the desktop/iPad "Add to Home Screen" onboarding snackbar.
 *
 * Unlike the mobile handoff sheet (opt-out via an explicit "Don't show again
 * today" button), this one caps itself automatically: the moment it's shown
 * — by any trigger, dismissed by any method — it's marked shown for the
 * calendar day and won't reappear until the next day. There's no separate
 * "viewed" dedup key because the daily cap already guarantees at most one
 * view per day, so the analytics view event can fire at the same moment.
 *
 * Storage can throw in some private-browsing contexts — every call is
 * wrapped so a failure just falls back to "always eligible to show," which
 * is the safer failure mode for a non-blocking prompt.
 */

export const DESKTOP_ONBOARDING_SHOWN_DATE_KEY = 'dnd-desktop-onboarding-shown-date'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function hasDesktopOnboardingShownToday(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(DESKTOP_ONBOARDING_SHOWN_DATE_KEY) === todayKey()
  } catch {
    return false
  }
}

export function markDesktopOnboardingShownToday(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DESKTOP_ONBOARDING_SHOWN_DATE_KEY, todayKey())
  } catch {
    // Ignore — worst case it shows again later today.
  }
}
