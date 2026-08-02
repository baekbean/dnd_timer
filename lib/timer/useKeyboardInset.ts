'use client'

import { useEffect, useState } from 'react'

/**
 * How many CSS pixels of the layout viewport's bottom edge are currently
 * covered by an on-screen software keyboard. 0 while `enabled` is false,
 * before mount, and in browsers without `window.visualViewport` — callers
 * get today's static behavior there, not a crash.
 *
 * `innerHeight - (visualViewport.height + visualViewport.offsetTop)` is the
 * standard technique for this: iOS Safari never shrinks `innerHeight` for
 * the keyboard (only `visualViewport`), so this reliably reports the
 * covered gap there; on Android configs where `innerHeight` already shrinks
 * with the keyboard, both terms shrink together and this harmlessly reports
 * ~0 (no extra offset needed since the layout already made room).
 */
export function useKeyboardInset(enabled: boolean): number {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      setInset(Math.max(0, Math.round(window.innerHeight - (vv.height + vv.offsetTop))))
    }

    update()
    vv.addEventListener('resize', update)
    // `scroll` catches the page scrolling the focused field into view while
    // the keyboard is up (offsetTop moves without a resize event).
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [enabled])

  return inset
}
