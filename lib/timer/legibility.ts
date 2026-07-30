const CUSTOM_SCENE_OVERLAY_OPACITY = 0.25

/** Flat black wash over the entire custom-scene video — replaces an earlier
 * centered vignette in favor of a simpler, uniform treatment. The single
 * opacity constant here is what both the CSS string and the contrast tests
 * below derive from, so tuning it keeps them in sync. */
export const customVideoOverlay = `rgba(0,0,0,${CUSTOM_SCENE_OVERLAY_OPACITY})`

function srgbToLinear(c: number): number {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

/**
 * Blends a flat black wash of `opacity` over an opaque color, the way the
 * browser composites `rgba(0,0,0,opacity)` on top — used to check how the
 * custom-scene overlay holds up against arbitrary (including worst-case
 * bright) video content. A flat wash is weaker than a vignette: bright/light
 * video content (white, yellow, cyan, pastels) can fall well short of WCAG AA
 * contrast against the near-white timer digits — see contrastRatio tests.
 */
export function blendBlackOverlay(rgb: [number, number, number], opacity: number): [number, number, number] {
  const k = 1 - opacity
  return [rgb[0] * k, rgb[1] * k, rgb[2] * k]
}

/** WCAG 2.x contrast ratio between two opaque sRGB colors. */
export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}
