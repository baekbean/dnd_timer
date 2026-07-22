'use client'
import { useEffect, useLayoutEffect, useState } from 'react'

// Returns true when the device is a phone held in landscape orientation.
// max-height: 500px excludes tablets and desktops that are also in landscape.
// Starts false to match SSR output; useLayoutEffect corrects before first paint
// on the client so there is no portrait-then-landscape flash on page load.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function useLandscape(): boolean {
  const [landscape, setLandscape] = useState(false)
  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia('(orientation: landscape) and (max-height: 500px)')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-guard: reads client-side matchMedia synchronously before first paint; one extra render is intentional
    setLandscape(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setLandscape(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return landscape
}
