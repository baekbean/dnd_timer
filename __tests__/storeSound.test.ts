import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY, useTimerStore } from '@/lib/timer/store'

function persistedState(state: Record<string, unknown>) {
  return JSON.stringify({ state, version: 0 })
}

function readPersisted(): Record<string, unknown> {
  const raw = localStorage.getItem(STORAGE_KEY)
  expect(raw).not.toBeNull()
  return JSON.parse(raw as string).state
}

describe('ambient preset state', () => {
  beforeEach(() => {
    localStorage.clear()
    useTimerStore.setState({ ambientPresetId: 'brown' })
  })

  it('defaults to brown — matches the original single-noise placeholder', () => {
    expect(useTimerStore.getState().ambientPresetId).toBe('brown')
  })

  it('stores a new preset and persists it', () => {
    useTimerStore.getState().setAmbientPresetId('rain')

    expect(useTimerStore.getState().ambientPresetId).toBe('rain')
    expect(readPersisted().ambientPresetId).toBe('rain')
  })

  it('defaults an absent field to brown when rehydrating pre-feature storage', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ sceneId: 'meadow' }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().ambientPresetId).toBe('brown')
  })

  it('repairs a corrupted persisted preset on load', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ ambientPresetId: 'garbage' }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().ambientPresetId).toBe('brown')
  })

  it('keeps a valid persisted preset on load', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ ambientPresetId: 'gardenCrickets' }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().ambientPresetId).toBe('gardenCrickets')
  })

  it('repairs a persisted "cafe" — removed now that it had no real recording behind it', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ ambientPresetId: 'cafe' }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().ambientPresetId).toBe('brown')
  })
})

describe('video volume state', () => {
  beforeEach(() => {
    localStorage.clear()
    useTimerStore.setState({ videoVolume: 0.6 })
  })

  it('defaults to 0.6, independent of the ambient volume field', () => {
    expect(useTimerStore.getState().videoVolume).toBe(0.6)
  })

  it('stores a new value and persists it, clamped to 0–1', () => {
    useTimerStore.getState().setVideoVolume(0.9)
    expect(useTimerStore.getState().videoVolume).toBe(0.9)
    expect(readPersisted().videoVolume).toBe(0.9)

    useTimerStore.getState().setVideoVolume(1.5)
    expect(useTimerStore.getState().videoVolume).toBe(1)

    useTimerStore.getState().setVideoVolume(-0.5)
    expect(useTimerStore.getState().videoVolume).toBe(0)
  })

  it('does not move in lockstep with the ambient volume field', () => {
    useTimerStore.getState().setVolume(0.1)
    useTimerStore.getState().setVideoVolume(0.9)

    expect(useTimerStore.getState().volume).toBe(0.1)
    expect(useTimerStore.getState().videoVolume).toBe(0.9)
  })

  it('defaults an absent field to 0.6 when rehydrating pre-feature storage', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ sceneId: 'meadow' }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().videoVolume).toBe(0.6)
  })

  it('repairs a corrupted persisted value on load', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ videoVolume: 'garbage' }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().videoVolume).toBe(0.6)
  })

  it('clamps an out-of-range persisted value on load rather than rejecting it outright', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ videoVolume: 4 }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().videoVolume).toBe(1)
  })

  it('keeps a valid persisted value on load', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ videoVolume: 0.3 }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().videoVolume).toBe(0.3)
  })
})
