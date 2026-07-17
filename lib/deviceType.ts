export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * Classifies the current device from the UA string. Viewport width alone
 * can't reliably separate a phone from an iPad (a portrait iPad Mini and a
 * large phone in landscape overlap in CSS pixel width), so this checks the
 * UA — including the iPadOS 13+ case where Safari reports "Macintosh" and
 * only multi-touch support gives it away.
 *
 * Kept free of 'use client' and react imports on purpose: lib/ga.ts pulls
 * this in, and the server component app/layout.tsx imports lib/ga.ts.
 */
export function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent

  const isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  if (isIPad) return 'tablet'

  const isMobileUA = /iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry|IEMobile|Opera Mini/.test(ua)
  if (isMobileUA) return 'mobile'

  const isAndroidTablet = /Android/.test(ua) && !/Mobile/.test(ua)
  if (isAndroidTablet) return 'tablet'

  return 'desktop'
}
