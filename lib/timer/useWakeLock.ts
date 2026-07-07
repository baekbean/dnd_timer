'use client'

import { useEffect } from 'react'

/**
 * Keeps the screen awake while `active`. Reacquires the lock when the tab
 * becomes visible again (the browser releases it on tab switch / minimize).
 * Requires iOS/iPadOS 16.4+ Safari; silently does nothing elsewhere.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return

    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      try {
        const l = await navigator.wakeLock.request('screen')
        if (cancelled) {
          l.release().catch(() => {})
        } else {
          lock = l
        }
      } catch {
        // Denied (low battery mode etc.) — nothing to do
      }
    }

    acquire()

    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquire()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      lock?.release().catch(() => {})
      lock = null
    }
  }, [active])
}
