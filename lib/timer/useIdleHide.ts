'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true when the user has been inactive for `delayMs` while `enabled`.
 * Any pointer/key/touch activity resets the countdown.
 */
export function useIdleHide(enabled: boolean, delayMs = 4000): boolean {
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    if (!enabled) {
      // Defer so the reset doesn't cascade into the render that disabled us
      const id = setTimeout(() => setIdle(false), 0)
      return () => clearTimeout(id)
    }

    let timer = setTimeout(() => setIdle(true), delayMs)
    const wake = () => {
      setIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => setIdle(true), delayMs)
    }

    window.addEventListener('pointermove', wake)
    window.addEventListener('pointerdown', wake)
    window.addEventListener('keydown', wake)
    window.addEventListener('touchstart', wake)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('keydown', wake)
      window.removeEventListener('touchstart', wake)
    }
  }, [enabled, delayMs])

  return idle
}
