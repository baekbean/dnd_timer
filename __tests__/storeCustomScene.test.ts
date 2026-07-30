import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CUSTOM_YOUTUBE_ID, DEFAULT_SCENE_ID } from '@/lib/timer/scenes'
import { STORAGE_KEY, useTimerStore } from '@/lib/timer/store'

const ALT_ID = 'tMJEp8p9IDM'

function persistedState(state: Record<string, unknown>) {
  return JSON.stringify({ state, version: 0 })
}

function readPersisted(): Record<string, unknown> {
  const raw = localStorage.getItem(STORAGE_KEY)
  expect(raw).not.toBeNull()
  return JSON.parse(raw as string).state
}

describe('custom YouTube scene state', () => {
  beforeEach(() => {
    localStorage.clear()
    useTimerStore.setState({
      customYoutubeId: DEFAULT_CUSTOM_YOUTUBE_ID,
      sceneId: DEFAULT_SCENE_ID,
    })
  })

  it('ships with the default video already in the slot', () => {
    expect(useTimerStore.getState().customYoutubeId).toBe(DEFAULT_CUSTOM_YOUTUBE_ID)
  })

  it('stores a new video id and persists it', () => {
    useTimerStore.getState().setCustomYoutubeId(ALT_ID)

    expect(useTimerStore.getState().customYoutubeId).toBe(ALT_ID)
    expect(readPersisted().customYoutubeId).toBe(ALT_ID)
  })

  it('ignores an id that is not a valid YouTube id', () => {
    useTimerStore.getState().setCustomYoutubeId('nope')

    expect(useTimerStore.getState().customYoutubeId).toBe(DEFAULT_CUSTOM_YOUTUBE_ID)
  })

  it('keeps the default when rehydrating state saved before this feature existed', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ sceneId: 'meadow', soundOn: false }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().sceneId).toBe('meadow')
    expect(useTimerStore.getState().customYoutubeId).toBe(DEFAULT_CUSTOM_YOUTUBE_ID)
  })

  it('repairs a corrupted persisted video id on load', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ customYoutubeId: '../../etc/passwd' }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().customYoutubeId).toBe(DEFAULT_CUSTOM_YOUTUBE_ID)
  })

  it('keeps a valid persisted video id on load', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ customYoutubeId: ALT_ID }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().customYoutubeId).toBe(ALT_ID)
  })

  it('survives a storage that throws on write', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => null,
        setItem: () => {
          throw new Error('quota exceeded')
        },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      },
    })

    expect(() => useTimerStore.getState().setCustomYoutubeId(ALT_ID)).not.toThrow()
    expect(useTimerStore.getState().customYoutubeId).toBe(ALT_ID)
  })
})

describe('custom sound source state', () => {
  beforeEach(() => {
    localStorage.clear()
    useTimerStore.setState({ customSoundSource: 'video' })
  })

  it('defaults to the video — the behavior that shipped before this field existed', () => {
    expect(useTimerStore.getState().customSoundSource).toBe('video')
  })

  it('stores the app source and persists it', () => {
    useTimerStore.getState().setCustomSoundSource('app')

    expect(useTimerStore.getState().customSoundSource).toBe('app')
    expect(readPersisted().customSoundSource).toBe('app')
  })

  it('defaults an absent field to video when rehydrating pre-feature storage', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ sceneId: 'custom' }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().customSoundSource).toBe('video')
  })

  it('repairs a corrupted persisted source on load', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ customSoundSource: 'garbage' }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().customSoundSource).toBe('video')
  })

  it('keeps a valid persisted app source on load', async () => {
    localStorage.setItem(STORAGE_KEY, persistedState({ customSoundSource: 'app' }))

    await useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()

    expect(useTimerStore.getState().customSoundSource).toBe('app')
  })
})
