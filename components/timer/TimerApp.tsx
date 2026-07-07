'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useTimerStore, type Phase, type TimerStatus } from '@/lib/timer/store'
import { getScene } from '@/lib/timer/scenes'
import { soundEngine } from '@/lib/timer/sound'
import { useWakeLock } from '@/lib/timer/useWakeLock'
import SceneBackground from '@/components/timer/SceneBackground'
import SettingsPanel from '@/components/timer/SettingsPanel'

const PHASE_LABEL: Record<Phase, string> = {
  focus: 'Focus',
  shortBreak: 'Short break',
  longBreak: 'Long break',
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${pad(m)}:${pad(s)}`
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 2L15 9L4 16V2Z" fill="#f6f6f3" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
      <rect x="1" y="1" width="5" height="16" rx="2" fill="#f6f6f3" />
      <rect x="10" y="1" width="5" height="16" rx="2" fill="#f6f6f3" />
    </svg>
  )
}

function SkipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 1L8 6L1 11V1Z" fill="#f6f6f3" />
      <rect x="9" y="1" width="2" height="10" rx="1" fill="#f6f6f3" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M12.25 7A5.25 5.25 0 1 1 7 1.75c1.98 0 3.7 1.1 4.6 2.72"
        stroke="#f6f6f3"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M11.9 1.4v3.2H8.7" stroke="#f6f6f3" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="#f6f6f3"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-.97 1.47V21a2 2 0 1 1-4 0v-.09a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.47-.97H3a2 2 0 1 1 0-4h.09A1.6 1.6 0 0 0 4.56 9a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 8.84 4.7 1.6 1.6 0 0 0 9.81 3.23V3a2 2 0 1 1 4 0v.09c0 .64.38 1.21.97 1.47.6.25 1.28.13 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.77c.26.59.83.97 1.47.97H21a2 2 0 1 1 0 4h-.09c-.64 0-1.21.38-1.47.97Z"
        stroke="#f6f6f3"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function FullscreenIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 1v5H1M10 1v5h5M6 15v-5H1M10 15v-5h5"
        stroke="#f6f6f3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M1 6V1h5M15 6V1h-5M1 10v5h5M15 10v5h-5"
        stroke="#f6f6f3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {})
    }
  }

  return { isFullscreen, toggle }
}

export default function TimerApp() {
  const phase = useTimerStore((s) => s.phase)
  const status = useTimerStore((s) => s.status)
  const remainingMs = useTimerStore((s) => s.remainingMs)
  const cyclePos = useTimerStore((s) => s.cyclePos)
  const sceneId = useTimerStore((s) => s.sceneId)
  const soundOn = useTimerStore((s) => s.soundOn)
  const volume = useTimerStore((s) => s.volume)
  const start = useTimerStore((s) => s.start)
  const pause = useTimerStore((s) => s.pause)
  const reset = useTimerStore((s) => s.reset)
  const skip = useTimerStore((s) => s.skip)
  const tick = useTimerStore((s) => s.tick)
  const setSoundOn = useTimerStore((s) => s.setSoundOn)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
  const scene = getScene(sceneId)

  // Rehydrate persisted state on the client, then reconcile with the wall clock
  useEffect(() => {
    useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()
  }, [])

  // Ticker — the store computes remaining time from endAt, so drift-free
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [status, tick])

  // Keep the screen awake while a session is running
  useWakeLock(status === 'running')

  // Ambient sound follows the running state
  useEffect(() => {
    if (status === 'running' && soundOn) {
      soundEngine.startAmbient(getScene(sceneId))
      return () => soundEngine.stopAmbient()
    }
  }, [status, soundOn, sceneId])

  useEffect(() => {
    soundEngine.setVolume(volume)
  }, [volume])

  // Chime when a phase ends while running (natural completion or skip)
  const prevRef = useRef<{ phase: Phase; status: TimerStatus } | null>(null)
  useEffect(() => {
    const prev = prevRef.current
    if (prev && prev.phase !== phase && prev.status === 'running' && soundOn) {
      soundEngine.playChime()
    }
    prevRef.current = { phase, status }
  }, [phase, status, soundOn])

  const phaseLabel =
    phase === 'focus' ? `Focus / Session ${cyclePos + 1}` : PHASE_LABEL[phase]

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden">
      <SceneBackground scene={scene} />

      {/* Sound — top left, hero-mockup pill */}
      <button
        type="button"
        aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
        aria-pressed={soundOn}
        onClick={() => setSoundOn(!soundOn)}
        className="absolute left-6 top-6 flex items-center gap-2 rounded-md px-3 py-2 transition-opacity hover:opacity-90"
        style={{
          background: 'rgba(44,44,44,0.4)',
          border: '0.5px solid rgba(44,44,44,0.2)',
          opacity: soundOn ? 1 : 0.55,
        }}
      >
        <Image src="/images/speaker-icon.svg" alt="" width={14} height={12} />
        <span className="text-[13px] leading-none text-[#f5f5f5]">
          {soundOn ? 'Sound' : 'Muted'}
        </span>
      </button>

      {/* Fullscreen + settings — top right */}
      <div className="absolute right-6 top-6 flex items-center gap-3">
        <button
          type="button"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          onClick={toggleFullscreen}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          style={{ background: 'rgba(44,44,44,0.25)' }}
        >
          <FullscreenIcon active={isFullscreen} />
        </button>
        <button
          type="button"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          style={{ background: 'rgba(44,44,44,0.25)' }}
        >
          <GearIcon />
        </button>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center gap-6 md:gap-10">
        <p className="text-[15px] leading-none text-[#f5f5f5] md:text-[18px]">{phaseLabel}</p>

        <span
          className="leading-none text-[#f6f6f3]"
          style={{
            fontFamily: 'var(--font-din-condensed)',
            fontWeight: 700,
            fontSize: 'clamp(96px, 24vw, 240px)',
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatTime(remainingMs)}
        </span>

        <div className="flex items-center justify-center gap-8 md:gap-10">
          <button
            type="button"
            aria-label="Reset"
            onClick={reset}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: 'rgba(246,246,243,0.4)' }}
          >
            <ResetIcon />
          </button>
          <button
            type="button"
            aria-label={status === 'running' ? 'Pause' : 'Start'}
            onClick={status === 'running' ? pause : start}
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: 'rgba(246,246,243,0.4)' }}
          >
            {status === 'running' ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            aria-label="Skip"
            onClick={skip}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: 'rgba(246,246,243,0.4)' }}
          >
            <SkipIcon />
          </button>
        </div>
      </div>

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </main>
  )
}
