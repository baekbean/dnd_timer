'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Fullscreens `elementRef.current` (not the whole document), so any content
 * elsewhere on the page — the SeoContent section below the timer, for
 * example — never becomes part of the fullscreen surface, regardless of
 * viewport or dvh rounding on any given device.
 */
export function useFullscreen(elementRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  // iPhone Safari has no Fullscreen API for non-video elements (iPadOS 16.4+
  // and other browsers do) — detect support so the button can hide itself
  // instead of sitting there doing nothing when tapped.
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const supported = typeof document.documentElement.requestFullscreen === 'function'
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-guard: detects fullscreen API support after hydration; server always starts false; one extra render is intentional
    setIsSupported(supported)
    if (!supported) return
    const onChange = () => setIsFullscreen(document.fullscreenElement === elementRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [elementRef])

  const toggle = () => {
    try {
      const result = document.fullscreenElement
        ? document.exitFullscreen?.()
        : elementRef.current?.requestFullscreen?.()
      result?.catch?.(() => {})
    } catch {
      // Fullscreen API unsupported or blocked
    }
  }

  return { isFullscreen, isSupported, toggle }
}
