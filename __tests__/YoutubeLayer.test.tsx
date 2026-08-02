import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import YoutubeLayer, { type YoutubeControls } from '@/components/timer/YoutubeLayer'

const VIDEO_ID = 'abcdefghijk'

// Minimal stand-in for the real YT.Player — captures the options it was
// constructed with and tracks mute state so the audio effect's branches
// (muted/unmuted/blocked) are all reachable without a real iframe.
// YT.PlayerState numeric values, per the real IFrame API.
const STATE_CUED = 5
const STATE_PLAYING = 1

function createFakePlayer(opts: { blockUnmute?: boolean } = {}) {
  const player = {
    _muted: true,
    // Starts CUED (not playing) — tests that never touch this simulate a
    // stuck/blocked autoplay; tests that flip it to STATE_PLAYING simulate
    // playback actually catching.
    _state: STATE_CUED,
    destroy: vi.fn(),
    mute: vi.fn(() => {
      player._muted = true
    }),
    unMute: vi.fn(() => {
      if (!opts.blockUnmute) player._muted = false
    }),
    isMuted: vi.fn(() => player._muted),
    setVolume: vi.fn(),
    playVideo: vi.fn(),
    seekTo: vi.fn(),
    getPlayerState: vi.fn(() => player._state),
  }
  return player
}

type FakePlayer = ReturnType<typeof createFakePlayer>

// The slice of the real YT.Player constructor options this test actually
// inspects/drives — not the full (private, unexported) YTNamespace shape.
interface FakePlayerOptions {
  videoId: string
  host?: string
  playerVars: Record<string, string | number>
  events: {
    onReady?: (event: { target: FakePlayer }) => void
    onError?: (event: { target: FakePlayer; data: number }) => void
    onStateChange?: (event: { target: FakePlayer; data: number }) => void
  }
}

let capturedOptions: FakePlayerOptions | undefined
let playerInstance: FakePlayer
let nextPlayerOpts: { blockUnmute?: boolean }

function installFakeYT() {
  nextPlayerOpts = {}
  capturedOptions = undefined
  playerInstance = undefined as unknown as FakePlayer
  Object.defineProperty(window, 'YT', {
    configurable: true,
    value: {
      // A real `function`, not an arrow — `new YT.Player(...)` (as the real
      // component calls it) requires a constructible implementation, or the
      // constructor throws and gets silently swallowed by the component's
      // own `.catch()`, leaving capturedOptions/playerInstance unset.
      Player: vi.fn().mockImplementation(function (_el: HTMLElement, options: FakePlayerOptions) {
        capturedOptions = options
        playerInstance = createFakePlayer(nextPlayerOpts)
        return playerInstance
      }),
      PlayerState: { ENDED: 0, PLAYING: STATE_PLAYING },
    },
  })
}

// The API-ready promise resolves as a microtask (window.YT.Player already
// exists, so loadYoutubeApi() short-circuits to Promise.resolve(window.YT)) —
// flush it before asserting on the constructed player.
async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve()
  })
}

function fireReady() {
  act(() => {
    capturedOptions?.events.onReady?.({ target: playerInstance })
  })
}

describe('YoutubeLayer', () => {
  beforeEach(() => {
    installFakeYT()
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'YT', { configurable: true, value: undefined })
  })

  it('constructs the player muted with autoplay/loop and plays on ready', async () => {
    render(<YoutubeLayer videoId={VIDEO_ID} soundOn={false} volume={0.6} onError={vi.fn()} onAudioBlockedChange={vi.fn()} />)
    await flushMicrotasks()

    expect(capturedOptions!.videoId).toBe(VIDEO_ID)
    expect(capturedOptions!.playerVars.mute).toBe(1)
    expect(capturedOptions!.playerVars.autoplay).toBe(1)
    expect(capturedOptions!.playerVars.loop).toBe(1)
    expect(capturedOptions!.playerVars.playlist).toBe(VIDEO_ID)
    expect(capturedOptions!.host).toBe('https://www.youtube-nocookie.com')

    fireReady()
    expect(playerInstance.playVideo).toHaveBeenCalled()
  })

  it('calls onReady once the player signals it has loaded', async () => {
    const onReady = vi.fn()
    render(
      <YoutubeLayer
        videoId={VIDEO_ID}
        soundOn={false}
        volume={0.6}
        onError={vi.fn()}
        onReady={onReady}
        onAudioBlockedChange={vi.fn()}
      />
    )
    await flushMicrotasks()

    expect(onReady).not.toHaveBeenCalled()
    fireReady()
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('mutes and reports not-blocked when soundOn is false', async () => {
    const onAudioBlockedChange = vi.fn()
    render(
      <YoutubeLayer videoId={VIDEO_ID} soundOn={false} volume={0.6} onError={vi.fn()} onAudioBlockedChange={onAudioBlockedChange} />
    )
    await flushMicrotasks()
    fireReady()

    expect(playerInstance.mute).toHaveBeenCalled()
    expect(onAudioBlockedChange).toHaveBeenCalledWith(false)
  })

  it('sets volume and unmutes when soundOn is true, then confirms it actually unmuted', async () => {
    vi.useFakeTimers()
    const onAudioBlockedChange = vi.fn()
    render(
      <YoutubeLayer videoId={VIDEO_ID} soundOn={true} volume={0.5} onError={vi.fn()} onAudioBlockedChange={onAudioBlockedChange} />
    )
    await flushMicrotasks()
    fireReady()

    expect(playerInstance.setVolume).toHaveBeenCalledWith(50)
    expect(playerInstance.unMute).toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onAudioBlockedChange).toHaveBeenLastCalledWith(false)
  })

  it('reports blocked when the browser silently refuses to unmute (iOS-style)', async () => {
    nextPlayerOpts.blockUnmute = true
    vi.useFakeTimers()
    const onAudioBlockedChange = vi.fn()
    render(
      <YoutubeLayer videoId={VIDEO_ID} soundOn={true} volume={0.5} onError={vi.fn()} onAudioBlockedChange={onAudioBlockedChange} />
    )
    await flushMicrotasks()
    fireReady()

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onAudioBlockedChange).toHaveBeenLastCalledWith(true)
  })

  it('forwards the raw error code from a non-recoverable player error', async () => {
    const onError = vi.fn()
    render(<YoutubeLayer videoId={VIDEO_ID} soundOn={false} volume={0.6} onError={onError} onAudioBlockedChange={vi.fn()} />)
    await flushMicrotasks()

    act(() => {
      capturedOptions!.events.onError?.({ target: playerInstance, data: 150 })
    })

    expect(onError).toHaveBeenCalledWith(150)
  })

  it('re-seeks to the start and replays on ENDED, backstopping the loop param', async () => {
    render(<YoutubeLayer videoId={VIDEO_ID} soundOn={false} volume={0.6} onError={vi.fn()} onAudioBlockedChange={vi.fn()} />)
    await flushMicrotasks()
    fireReady()
    playerInstance.playVideo.mockClear()

    act(() => {
      capturedOptions!.events.onStateChange?.({ target: playerInstance, data: 0 })
    })

    expect(playerInstance.seekTo).toHaveBeenCalledWith(0, true)
    expect(playerInstance.playVideo).toHaveBeenCalled()
  })

  it('re-issues playVideo with backoff when autoplay never actually starts', async () => {
    vi.useFakeTimers()
    render(<YoutubeLayer videoId={VIDEO_ID} soundOn={false} volume={0.6} onError={vi.fn()} onAudioBlockedChange={vi.fn()} />)
    await flushMicrotasks()
    fireReady()
    playerInstance.playVideo.mockClear()

    // playerInstance._state stays CUED throughout — simulates a browser that
    // silently refused autoplay without ever firing an error event.
    act(() => {
      vi.advanceTimersByTime(700) // first verify
    })
    expect(playerInstance.playVideo).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(1000) // second verify (500ms * 2^1 backoff)
    })
    expect(playerInstance.playVideo).toHaveBeenCalledTimes(2)
  })

  it('stops retrying once playback actually starts', async () => {
    vi.useFakeTimers()
    render(<YoutubeLayer videoId={VIDEO_ID} soundOn={false} volume={0.6} onError={vi.fn()} onAudioBlockedChange={vi.fn()} />)
    await flushMicrotasks()
    fireReady()
    playerInstance.playVideo.mockClear()

    playerInstance._state = STATE_PLAYING
    act(() => {
      vi.advanceTimersByTime(700)
    })

    expect(playerInstance.playVideo).not.toHaveBeenCalled()
  })

  it('clears the pending retry once an onStateChange PLAYING event fires', async () => {
    vi.useFakeTimers()
    render(<YoutubeLayer videoId={VIDEO_ID} soundOn={false} volume={0.6} onError={vi.fn()} onAudioBlockedChange={vi.fn()} />)
    await flushMicrotasks()
    fireReady()
    playerInstance.playVideo.mockClear()

    act(() => {
      capturedOptions!.events.onStateChange?.({ target: playerInstance, data: STATE_PLAYING })
    })
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(playerInstance.playVideo).not.toHaveBeenCalled()
  })

  it('exposes retryPlay via controlsRef, nudging playback only when not already playing', async () => {
    const controlsRef = { current: null as YoutubeControls | null }
    render(
      <YoutubeLayer
        videoId={VIDEO_ID}
        soundOn={false}
        volume={0.6}
        onError={vi.fn()}
        onAudioBlockedChange={vi.fn()}
        controlsRef={controlsRef}
      />
    )
    await flushMicrotasks()
    fireReady()
    playerInstance.playVideo.mockClear()

    act(() => {
      controlsRef.current!.retryPlay()
    })
    expect(playerInstance.playVideo).toHaveBeenCalledTimes(1)

    playerInstance._state = STATE_PLAYING
    playerInstance.playVideo.mockClear()
    act(() => {
      controlsRef.current!.retryPlay()
    })
    expect(playerInstance.playVideo).not.toHaveBeenCalled()
  })

  it('exposes retryUnmute via controlsRef, re-checking the blocked state synchronously', async () => {
    nextPlayerOpts.blockUnmute = true
    const controlsRef = { current: null as YoutubeControls | null }
    const onAudioBlockedChange = vi.fn()
    render(
      <YoutubeLayer
        videoId={VIDEO_ID}
        soundOn={true}
        volume={0.6}
        onError={vi.fn()}
        onAudioBlockedChange={onAudioBlockedChange}
        controlsRef={controlsRef}
      />
    )
    await flushMicrotasks()
    fireReady()

    expect(controlsRef.current).toBeTruthy()
    playerInstance.unMute.mockClear()
    onAudioBlockedChange.mockClear()

    act(() => {
      controlsRef.current!.retryUnmute()
    })

    expect(playerInstance.unMute).toHaveBeenCalled()
    // Blocked stays true (blockUnmute), and retryUnmute checks isMuted() immediately —
    // no need to wait out UNMUTE_VERIFY_MS.
    expect(onAudioBlockedChange).toHaveBeenCalledWith(true)
  })

  it('exposes duck via controlsRef: drops volume immediately, restores it after the duration', async () => {
    vi.useFakeTimers()
    const controlsRef = { current: null as YoutubeControls | null }
    render(
      <YoutubeLayer
        videoId={VIDEO_ID}
        soundOn={true}
        volume={0.6}
        onError={vi.fn()}
        onAudioBlockedChange={vi.fn()}
        controlsRef={controlsRef}
      />
    )
    await flushMicrotasks()
    fireReady()
    playerInstance.setVolume.mockClear()

    act(() => {
      controlsRef.current!.duck(2000)
    })
    expect(playerInstance.setVolume).toHaveBeenLastCalledWith(15) // round(60 * 0.25)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(playerInstance.setVolume).toHaveBeenLastCalledWith(60)
  })

  it('destroys the player and clears the mount point on unmount', async () => {
    const { unmount } = render(
      <YoutubeLayer videoId={VIDEO_ID} soundOn={false} volume={0.6} onError={vi.fn()} onAudioBlockedChange={vi.fn()} />
    )
    await flushMicrotasks()
    fireReady()

    unmount()

    expect(playerInstance.destroy).toHaveBeenCalled()
  })
})
