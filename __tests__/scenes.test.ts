import { describe, expect, it } from 'vitest'
import {
  buildCustomScene,
  CUSTOM_SCENE_ID,
  DEFAULT_CUSTOM_YOUTUBE_ID,
  DEFAULT_SCENE_ID,
  getScene,
  resolveScene,
  SCENES,
} from '@/lib/timer/scenes'
import { customVideoOverlay } from '@/lib/timer/legibility'

describe('buildCustomScene', () => {
  it('carries the video id and never joins the built-in catalog', () => {
    const scene = buildCustomScene('abcdefghijk')
    expect(scene.id).toBe(CUSTOM_SCENE_ID)
    expect(scene.youtube).toEqual({ videoId: 'abcdefghijk' })
    expect(scene.fallbackGradient).toBeTruthy()
    expect(SCENES.some((s) => s.id === CUSTOM_SCENE_ID)).toBe(false)
  })

  it('carries the flat video overlay for legibility over arbitrary video content', () => {
    expect(buildCustomScene('abcdefghijk').overlay).toBe(customVideoOverlay)
  })
})

describe('resolveScene', () => {
  it('builds the custom scene from the stored video id', () => {
    expect(resolveScene(CUSTOM_SCENE_ID, 'abcdefghijk').youtube).toEqual({
      videoId: 'abcdefghijk',
    })
  })

  it('returns built-in scenes untouched', () => {
    const meadow = resolveScene('meadow', DEFAULT_CUSTOM_YOUTUBE_ID)
    expect(meadow.id).toBe('meadow')
    expect(meadow.youtube).toBeUndefined()
    expect(meadow.backgroundImage).toBeTruthy()
  })

  it('falls back to the default scene for an unknown id', () => {
    expect(resolveScene('bogus', DEFAULT_CUSTOM_YOUTUBE_ID).id).toBe(DEFAULT_SCENE_ID)
  })
})

describe('getScene', () => {
  it('still swallows the custom id — which is why resolveScene exists', () => {
    expect(getScene(CUSTOM_SCENE_ID).id).toBe(DEFAULT_SCENE_ID)
  })
})
