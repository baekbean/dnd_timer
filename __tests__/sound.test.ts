import { describe, expect, it } from 'vitest'
import { AMBIENT_PRESET_IDS, crossfadeLoopSeam } from '@/lib/timer/sound'

describe('AMBIENT_PRESET_IDS', () => {
  it('no longer offers cafe — it had no real recording behind it', () => {
    expect(AMBIENT_PRESET_IDS).not.toContain('cafe')
  })

  it('offers the 4 real-recording presets alongside the 2 synthesized ones', () => {
    expect(AMBIENT_PRESET_IDS).toEqual(
      expect.arrayContaining(['white', 'brown', 'rain', 'birds', 'gardenCrickets', 'nightBugs'])
    )
    expect(AMBIENT_PRESET_IDS).toHaveLength(6)
  })
})

describe('crossfadeLoopSeam', () => {
  it('trims the buffer by exactly the fade length', () => {
    const channel = new Float32Array(100).map((_, i) => i)
    const out = crossfadeLoopSeam(channel, 10)
    expect(out.length).toBe(90)
  })

  it('blends the tail into the head across the fade window', () => {
    const n = 100
    const fade = 10
    const channel = new Float32Array(n).map((_, i) => i)
    const out = crossfadeLoopSeam(channel, fade)

    // At the very start of the fade (t=0), the output is dominated by the tail.
    expect(out[0]).toBeCloseTo(channel[n - fade])
    // Partway through, it's an even blend of head and tail.
    const mid = Math.floor(fade / 2)
    const t = mid / fade
    expect(out[mid]).toBeCloseTo(channel[mid] * t + channel[n - fade + mid] * (1 - t))
  })

  it('leaves samples after the fade window untouched', () => {
    const channel = new Float32Array(100).map((_, i) => i)
    const out = crossfadeLoopSeam(channel, 10)
    for (let i = 10; i < out.length; i++) {
      expect(out[i]).toBe(channel[i])
    }
  })

  it('caps the fade at 1/8 of the buffer so a short clip is never blended away entirely', () => {
    const channel = new Float32Array(16).map((_, i) => i)
    const out = crossfadeLoopSeam(channel, 100)
    // fade capped to floor(16/8) = 2
    expect(out.length).toBe(14)
  })

  it('is a no-op copy when fadeFrames is 0', () => {
    const channel = new Float32Array([1, 2, 3, 4])
    const out = crossfadeLoopSeam(channel, 0)
    expect(Array.from(out)).toEqual([1, 2, 3, 4])
  })
})
