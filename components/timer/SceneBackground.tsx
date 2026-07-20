'use client'

import { useEffect, useRef } from 'react'
import type { Scene } from '@/lib/timer/scenes'

const MAX_RETRIES = 5
const BASE_RETRY_DELAY_MS = 500
const MAX_RETRY_DELAY_MS = 5000

export default function SceneBackground({ scene }: { scene: Scene }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Self-healing playback: iOS discards a backgrounded PWA's video decode
  // buffer while keeping the DOM alive, and `key={scene.id}` below fully
  // remounts this element on every scene switch — in both cases the native
  // `autoPlay` attribute alone isn't reliable, so we drive `.play()`
  // ourselves and retry on visibility/pageshow/stall signals.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !scene.video) return

    let playAttemptPending = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let retryCount = 0

    const ensurePlaying = () => {
      if (!video.paused) return
      if (playAttemptPending) return
      if (video.readyState === 0 || video.networkState === video.NETWORK_EMPTY || video.error) {
        video.load()
      }
      playAttemptPending = true
      Promise.resolve(video.play())
        .catch(() => {})
        .finally(() => {
          playAttemptPending = false
        })
    }

    const clearRetryTimer = () => {
      if (retryTimer) {
        clearTimeout(retryTimer)
        retryTimer = null
      }
    }

    const scheduleRetry = () => {
      if (retryTimer || retryCount >= MAX_RETRIES) return
      const delay = Math.min(BASE_RETRY_DELAY_MS * 2 ** retryCount, MAX_RETRY_DELAY_MS)
      retryTimer = setTimeout(() => {
        retryTimer = null
        retryCount += 1
        if (!video.isConnected) return
        ensurePlaying()
      }, delay)
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') ensurePlaying()
    }

    const onPageShow = () => ensurePlaying()

    const onUnexpectedStop = () => {
      if (document.visibilityState !== 'visible') return
      scheduleRetry()
    }

    const onPlaying = () => {
      retryCount = 0
      clearRetryTimer()
    }

    ensurePlaying()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', onPageShow)
    video.addEventListener('pause', onUnexpectedStop)
    video.addEventListener('stalled', onUnexpectedStop)
    video.addEventListener('suspend', onUnexpectedStop)
    video.addEventListener('error', onUnexpectedStop)
    video.addEventListener('playing', onPlaying)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', onPageShow)
      video.removeEventListener('pause', onUnexpectedStop)
      video.removeEventListener('stalled', onUnexpectedStop)
      video.removeEventListener('suspend', onUnexpectedStop)
      video.removeEventListener('error', onUnexpectedStop)
      video.removeEventListener('playing', onPlaying)
      clearRetryTimer()
    }
  }, [scene.id, scene.video])

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute overflow-hidden"
        style={{
          inset: 'clamp(12px, 3vw, 24px)',
          borderRadius: 'clamp(24px, 10vw, 200px)',
          background: scene.fallbackGradient,
        }}
      >
        {scene.video && (
          <video
            ref={videoRef}
            key={scene.id}
            className="absolute inset-0 h-full w-full object-fill"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={scene.video.poster}
          >
            {scene.video.webm && <source src={scene.video.webm} type="video/webm" />}
            {scene.video.mp4 && <source src={scene.video.mp4} type="video/mp4" />}
          </video>
        )}
        {!scene.video && scene.backgroundImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={scene.id}
            src={scene.backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-fill"
          />
        )}
        {scene.overlay && <div className="absolute inset-0" style={{ background: scene.overlay }} />}
      </div>
    </div>
  )
}
