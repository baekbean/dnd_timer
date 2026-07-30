import { describe, expect, it } from 'vitest'
import { blendBlackOverlay, contrastRatio, customVideoOverlay } from '@/lib/timer/legibility'

describe('customVideoOverlay', () => {
  it('is a flat 25% black wash', () => {
    expect(customVideoOverlay).toBe('rgba(0,0,0,0.25)')
  })
})

// Timer digits render at #f6f6f3 — near-white.
const DIGIT_RGB: [number, number, number] = [246, 246, 243]
const OVERLAY_OPACITY = 0.25
const WCAG_AA = 4.5

describe('contrast of the flat overlay against arbitrary video content', () => {
  it('meets WCAG AA over mid-to-dark content', () => {
    const midGray = blendBlackOverlay([128, 128, 128], OVERLAY_OPACITY)
    expect(contrastRatio(DIGIT_RGB, midGray)).toBeGreaterThanOrEqual(WCAG_AA)

    const red = blendBlackOverlay([255, 0, 0], OVERLAY_OPACITY)
    expect(contrastRatio(DIGIT_RGB, red)).toBeGreaterThanOrEqual(WCAG_AA)

    const black = blendBlackOverlay([0, 0, 0], OVERLAY_OPACITY)
    expect(contrastRatio(DIGIT_RGB, black)).toBeGreaterThanOrEqual(WCAG_AA)
  })

  it('falls well short of WCAG AA over bright/light content — a known gap of a flat (non-vignette) overlay', () => {
    const white = blendBlackOverlay([255, 255, 255], OVERLAY_OPACITY)
    expect(contrastRatio(DIGIT_RGB, white)).toBeLessThan(3)

    const yellow = blendBlackOverlay([255, 255, 0], OVERLAY_OPACITY)
    expect(contrastRatio(DIGIT_RGB, yellow)).toBeLessThan(3)

    const cyan = blendBlackOverlay([0, 255, 255], OVERLAY_OPACITY)
    expect(contrastRatio(DIGIT_RGB, cyan)).toBeLessThan(3)
  })
})
