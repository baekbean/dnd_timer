'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

// Minimal surface of the YouTube IFrame Player API that we actually call.
// The official @types/youtube package isn't worth a dependency for this.
interface YTPlayer {
  destroy(): void
  mute(): void
  unMute(): void
  isMuted(): boolean
  setVolume(volume: number): void
  playVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
}

interface YTPlayerEvent {
  target: YTPlayer
  data: number
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      width?: string | number
      height?: string | number
      host?: string
      videoId: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (event: YTPlayerEvent) => void
        onError?: (event: YTPlayerEvent) => void
        onStateChange?: (event: YTPlayerEvent) => void
      }
    }
  ) => YTPlayer
  PlayerState: { ENDED: number }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

/** Handed up to TimerApp so the chime can duck the music and the iOS
 *  "tap to enable sound" chip can retry from a real user gesture. */
export interface YoutubeControls {
  retryUnmute: () => void
  duck: (durationMs: number) => void
}

// The API script is fetched once per page load, and only for people who
// actually pick the custom scene — the four built-in scenes pay nothing.
// NOTE: if a script-src/frame-src CSP is ever added to next.config.ts, it must
// allow www.youtube.com, www.youtube-nocookie.com and i.ytimg.com.
const API_SRC = 'https://www.youtube.com/iframe_api'
const PLAYER_HOST = 'https://www.youtube-nocookie.com'
const DUCKED_RATIO = 0.25
/** Long enough for the player to honour (or refuse) unMute before we check. */
const UNMUTE_VERIFY_MS = 400

let apiPromise: Promise<YTNamespace> | null = null

function loadYoutubeApi(): Promise<YTNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube API is browser-only'))
  }
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    // The API calls a single global hook, so chain rather than clobber
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error('YouTube IFrame API loaded without a Player'))
    }

    const script = document.createElement('script')
    script.src = API_SRC
    script.async = true
    script.onerror = () => {
      // Let a later attempt retry — an offline first load shouldn't be terminal
      apiPromise = null
      reject(new Error('Failed to load the YouTube IFrame API'))
    }
    document.head.appendChild(script)
  })

  return apiPromise
}

interface Props {
  videoId: string
  soundOn: boolean
  /** 0–1, shared with the chime via the Settings volume slider. */
  volume: number
  /** Non-recoverable player errors: 2, 5, 100, 101, 150. */
  onError: (code: number) => void
  /** True once we know the browser refused to unmute (iOS, mostly). */
  onAudioBlockedChange: (blocked: boolean) => void
  controlsRef?: RefObject<YoutubeControls | null>
}

export default function YoutubeLayer({
  videoId,
  soundOn,
  volume,
  onError,
  onAudioBlockedChange,
  controlsRef,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const duckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ready, setReady] = useState(false)

  // Kept in a ref so an unstable callback identity in the parent can't tear
  // down and rebuild the player or the audio effect on every render.
  const callbacksRef = useRef({ onError, onAudioBlockedChange })
  useEffect(() => {
    callbacksRef.current = { onError, onAudioBlockedChange }
  })

  // duck()'s setTimeout below closes over `volume` at schedule time — if the
  // slider moves while a duck is in flight, the effect rebuilds `duck` with
  // the new value, but the already-scheduled restore keeps the stale one.
  // Reading through a ref instead means the restore always uses the latest.
  const volumeRef = useRef(volume)
  useEffect(() => {
    volumeRef.current = volume
  })

  // A new video gets a brand new player. Swapping via loadVideoById would leave
  // the `playlist` loop param pointing at the previous id, and switching is a
  // rare, deliberate action — not worth the extra state to optimize.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let cancelled = false
    let player: YTPlayer | null = null
    const host = document.createElement('div')
    wrapper.appendChild(host)

    loadYoutubeApi()
      .then((YT) => {
        if (cancelled) return
        player = new YT.Player(host, {
          width: '100%',
          height: '100%',
          host: PLAYER_HOST,
          videoId,
          playerVars: {
            autoplay: 1,
            // Muted start is mandatory — every browser blocks audible
            // autoplay. The audio effect below unmutes right after.
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            loop: 1,
            playlist: videoId,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return
              event.target.playVideo()
              setReady(true)
            },
            onError: (event) => {
              if (cancelled) return
              callbacksRef.current.onError(event.data)
            },
            onStateChange: (event) => {
              // Backstop for the loop param, which doesn't cover every video
              if (event.data === YT.PlayerState.ENDED) {
                event.target.seekTo(0, true)
                event.target.playVideo()
              }
            },
          },
        })
        playerRef.current = player
      })
      .catch(() => {
        // Script blocked or offline — the fallback gradient stays visible
      })

    return () => {
      cancelled = true
      setReady(false)
      playerRef.current = null
      try {
        player?.destroy()
      } catch {}
      wrapper.replaceChildren()
    }
  }, [videoId])

  // Audio follows the Sound pill directly, not the running state — picking a
  // music video and hearing nothing until you start a session reads as broken.
  useEffect(() => {
    const player = playerRef.current
    if (!player || !ready) return

    if (!soundOn) {
      try {
        player.mute()
      } catch {}
      callbacksRef.current.onAudioBlockedChange(false)
      return
    }

    try {
      player.setVolume(Math.round(volume * 100))
      player.unMute()
    } catch {}

    // A parent-frame gesture doesn't always carry into a cross-origin iframe
    // (iOS especially), and unMute fails silently when it doesn't — so ask.
    const id = setTimeout(() => {
      try {
        callbacksRef.current.onAudioBlockedChange(player.isMuted())
      } catch {}
    }, UNMUTE_VERIFY_MS)
    return () => clearTimeout(id)
  }, [ready, soundOn, volume])

  // Same self-healing intent as the <video> path in SceneBackground: mobile
  // browsers suspend the player while backgrounded and don't always resume.
  useEffect(() => {
    if (!ready) return
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return
      try {
        playerRef.current?.playVideo()
      } catch {}
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', onVisibility)
    }
  }, [ready])

  useEffect(() => {
    if (!controlsRef) return
    controlsRef.current = {
      retryUnmute: () => {
        const player = playerRef.current
        if (!player) return
        try {
          player.setVolume(Math.round(volume * 100))
          player.unMute()
          callbacksRef.current.onAudioBlockedChange(player.isMuted())
        } catch {}
      },
      duck: (durationMs) => {
        const player = playerRef.current
        if (!player) return
        if (duckTimerRef.current) clearTimeout(duckTimerRef.current)
        try {
          player.setVolume(Math.round(volume * 100 * DUCKED_RATIO))
        } catch {}
        duckTimerRef.current = setTimeout(() => {
          duckTimerRef.current = null
          try {
            playerRef.current?.setVolume(Math.round(volumeRef.current * 100))
          } catch {}
        }, durationMs)
      },
    }
    return () => {
      controlsRef.current = null
    }
  }, [controlsRef, volume, ready])

  useEffect(
    () => () => {
      if (duckTimerRef.current) clearTimeout(duckTimerRef.current)
    },
    []
  )

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0"
    />
  )
}
