'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useTimerStore, type Phase } from '@/lib/timer/store'
import {
  trackTimerStart,
  trackSessionComplete,
  trackSessionAbandon,
  trackFullscreenEnter,
  trackFocusExtend,
} from '@/lib/ga'
import { getScene } from '@/lib/timer/scenes'
import { soundEngine } from '@/lib/timer/sound'
import { useWakeLock } from '@/lib/timer/useWakeLock'
import { useIdleHide } from '@/lib/timer/useIdleHide'
import SceneBackground from '@/components/timer/SceneBackground'
import SettingsPanel from '@/components/timer/SettingsPanel'
import ScenePicker from '@/components/timer/ScenePicker'
import CompleteOverlay from '@/components/timer/CompleteOverlay'
import ResetSessionToast from '@/components/timer/ResetSessionToast'

const PHASE_LABEL: Record<Phase, string> = {
  focus: 'Focus',
  shortBreak: 'Short break',
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
    <svg width="27" height="27" viewBox="0 0 18 18" fill="none">
      <path d="M4 2L15 9L4 16V2Z" fill="#f6f6f3" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="24" height="27" viewBox="0 0 16 18" fill="none">
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

function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <path
        d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"
        stroke="#f6f6f3"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FloatingExtendBadge({ minutes, onDone }: { minutes: number; onDone: () => void }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const anim = el.animate(
      [
        { transform: 'translateY(0px)', opacity: 0 },
        { transform: 'translateY(-6px)', opacity: 1, offset: 0.2 },
        { transform: 'translateY(-22px)', opacity: 0 },
      ],
      { duration: 700, easing: 'ease-out' }
    )
    anim.onfinish = onDone
    return () => anim.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span
      ref={ref}
      className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-[13px] font-semibold leading-none text-[#f6f6f3]"
    >
      +{minutes} min
    </span>
  )
}

function FocusExtendControl({ onExtend }: { onExtend: (minutes: number) => void }) {
  const focusExtendMin = useTimerStore((s) => s.settings.focusExtendMin)
  const extendFocus = useTimerStore((s) => s.extendFocus)
  const updateSettings = useTimerStore((s) => s.updateSettings)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(String(focusExtendMin))
  const [floats, setFloats] = useState<{ id: number; minutes: number }[]>([])

  const commit = () => {
    const parsed = Number(text)
    const clamped =
      text.trim() !== '' && Number.isFinite(parsed)
        ? Math.min(180, Math.max(1, Math.round(parsed)))
        : focusExtendMin
    setText(String(clamped))
    if (clamped !== focusExtendMin) updateSettings({ focusExtendMin: clamped })
    setEditing(false)
  }

  if (editing) {
    return (
      <div
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
        style={{ background: 'rgba(246,246,243,0.15)', border: '1px solid rgba(246,246,243,0.3)' }}
      >
        <input
          type="number"
          inputMode="numeric"
          autoFocus
          value={text}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '' || /^\d+$/.test(raw)) setText(raw)
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') {
              setText(String(focusExtendMin))
              setEditing(false)
            }
          }}
          className="w-8 bg-transparent text-center text-[13px] leading-none text-[#f6f6f3] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          style={{ MozAppearance: 'textfield' }}
        />
        <span className="text-[13px] leading-none text-[#f6f6f3]">min</span>
      </div>
    )
  }

  return (
    <div
      className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{ background: 'rgba(246,246,243,0.15)', border: '1px solid rgba(246,246,243,0.3)' }}
    >
      {floats.map((f) => (
        <FloatingExtendBadge
          key={f.id}
          minutes={f.minutes}
          onDone={() => setFloats((prev) => prev.filter((p) => p.id !== f.id))}
        />
      ))}
      <button
        type="button"
        onClick={() => {
          extendFocus(focusExtendMin)
          trackFocusExtend({ minutes: focusExtendMin })
          onExtend(focusExtendMin)
          setFloats((prev) => [...prev, { id: Date.now() + Math.random(), minutes: focusExtendMin }])
        }}
        className="text-[13px] leading-none text-[#f6f6f3] transition-opacity hover:opacity-80"
      >
        +{focusExtendMin} min
      </button>
      <button
        type="button"
        aria-label="Edit extend amount"
        onClick={() => {
          setText(String(focusExtendMin))
          setEditing(true)
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100"
      >
        <PencilIcon />
      </button>
    </div>
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
    try {
      const result = document.fullscreenElement
        ? document.exitFullscreen?.()
        : document.documentElement.requestFullscreen?.()
      result?.catch?.(() => {})
    } catch {
      // Fullscreen API unsupported or blocked (e.g. Safari <16.4 returns no promise)
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
  const resetSession = useTimerStore((s) => s.resetSession)
  const skip = useTimerStore((s) => s.skip)
  const tick = useTimerStore((s) => s.tick)
  const setSoundOn = useTimerStore((s) => s.setSoundOn)
  const settings = useTimerStore((s) => s.settings)
  const completions = useTimerStore((s) => s.completions)
  const lastCompletedPhase = useTimerStore((s) => s.lastCompletedPhase)
  const justCompletedFocus = useTimerStore((s) => s.justCompletedFocus)
  const dismissComplete = useTimerStore((s) => s.dismissComplete)
  const sessionsToday = useTimerStore((s) => s.daily.completedSessions)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showResetToast, setShowResetToast] = useState(false)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
  const scene = getScene(sceneId)

  // Brief scale pulse on the digits whenever the user extends the focus session
  const digitsRef = useRef<HTMLSpanElement>(null)
  const handleExtendPulse = () => {
    const el = digitsRef.current
    if (!el) return
    el.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }],
      { duration: 320, easing: 'ease-out' }
    )
  }

  // Chrome fades away while a session runs untouched — camera-ready screen
  const chromeHidden = useIdleHide(status === 'running' && !settingsOpen && !justCompletedFocus)
  const chromeClass = `transition-opacity duration-700 ${
    chromeHidden ? 'pointer-events-none opacity-0' : 'opacity-100'
  }`

  // Rehydrate persisted state on the client, then reconcile with the wall clock
  useEffect(() => {
    useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()
  }, [])

  // If ambient started while the AudioContext was suspended (reload mid-session),
  // the first gesture unlocks it
  useEffect(() => {
    const unlock = () => soundEngine.resume()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // Ticker — the store computes remaining time from endAt, so drift-free
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [status, tick])

  // Keep the screen awake while a session is running
  useWakeLock(status === 'running')

  // Ambient sound follows the running state. Keyed on the ambient's own identity
  // (not sceneId) so switching between scenes that share the same ambient track
  // doesn't restart playback.
  const ambient = scene.ambient
  const ambientKey = ambient.kind === 'file' ? `file:${ambient.src}` : 'noise'
  useEffect(() => {
    if (status === 'running' && soundOn) {
      soundEngine.startAmbient(getScene(sceneId))
      return () => soundEngine.stopAmbient()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, soundOn, ambientKey])

  useEffect(() => {
    soundEngine.setVolume(volume)
  }, [volume])

  // Natural completion → chime + (optional) notification. First run only records
  // the baseline so offline-replayed completions don't fire on load.
  const prevCompletionsRef = useRef<number | null>(null)
  useEffect(() => {
    const prev = prevCompletionsRef.current
    prevCompletionsRef.current = completions
    if (prev === null || completions <= prev) return

    trackSessionComplete({
      completed_phase: lastCompletedPhase ?? 'focus',
      sessions_today: useTimerStore.getState().daily.completedSessions,
    })

    if (soundOn) soundEngine.playChime()

    if (
      settings.notifyOnComplete &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted' &&
      document.visibilityState !== 'visible'
    ) {
      const body =
        phase === 'focus'
          ? 'Break is over — ready to focus.'
          : 'Focus session complete — time for a break.'
      try {
        new Notification('Do Not Disturb Timer', { body })
      } catch {}
    }
  }, [completions, lastCompletedPhase, soundOn, settings.notifyOnComplete, phase])

  const handleStartPause = () => {
    if (status === 'running') {
      pause()
    } else {
      trackTimerStart({ phase, scene_id: sceneId, focus_min: settings.focusMin })
      start()
    }
  }

  const abandonIfMidFocus = (via: 'reset' | 'skip') => {
    if (phase === 'focus' && status !== 'idle') {
      trackSessionAbandon({ via, remaining_ms: remainingMs })
    }
  }

  const handleReset = () => {
    abandonIfMidFocus('reset')
    reset()
    // Only worth asking if there's more session left than the segment we just reset
    if (phase !== 'focus' || cyclePos > 0) setShowResetToast(true)
  }

  const handleResetSessionConfirm = () => {
    setShowResetToast(false)
    resetSession()
  }

  const handleSkip = () => {
    abandonIfMidFocus('skip')
    skip()
  }

  const handleFullscreen = () => {
    if (!isFullscreen) trackFullscreenEnter()
    toggleFullscreen()
  }

  const phaseLabel =
    phase === 'focus' ? `Focus / Session ${cyclePos + 1}` : PHASE_LABEL[phase]

  // Countdown in the tab title while the tab is in the background
  const timeText = formatTime(remainingMs)
  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      document.title = `${timeText} · ${PHASE_LABEL[phase]} — Do Not Disturb Timer`
    } else {
      document.title = 'Do Not Disturb Timer'
    }
    return () => {
      document.title = 'Do Not Disturb Timer'
    }
  }, [timeText, status, phase])

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden"
      style={{ cursor: chromeHidden ? 'none' : 'auto' }}
    >
      <SceneBackground scene={scene} />

      {/* Sound — top left, hero-mockup pill */}
      <div className={`absolute left-6 top-6 ${chromeClass}`}>
        <button
          type="button"
          aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
          aria-pressed={soundOn}
          onClick={() => setSoundOn(!soundOn)}
          className="flex items-center gap-2 rounded-md px-3 py-2 transition-opacity hover:opacity-90"
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
      </div>

      {/* Fullscreen + settings — top right */}
      <div className={`absolute right-6 top-6 flex items-center gap-3 ${chromeClass}`}>
        <button
          type="button"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          onClick={handleFullscreen}
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
        <div className="flex flex-col items-center gap-2">
          <p className="text-[15px] leading-none text-[#f5f5f5] md:text-[18px]">{phaseLabel}</p>
          {settings.sessionsPerCycle > 1 && (
            <div
              className="flex items-center gap-[6px]"
              role="img"
              aria-label={`Session ${Math.min(cyclePos + 1, settings.sessionsPerCycle)} of ${settings.sessionsPerCycle}`}
            >
              {Array.from({ length: settings.sessionsPerCycle }).map((_, i) => {
                const isCurrent = phase === 'focus' && i === cyclePos
                return (
                  <span
                    key={i}
                    className={`block h-[7px] w-[7px] rounded-full ${isCurrent ? 'animate-pulse' : ''}`}
                    aria-hidden="true"
                    style={
                      i < cyclePos || isCurrent
                        ? { background: '#f6f6f3' }
                        : { border: '1px solid #f6f6f3', opacity: 0.45 }
                    }
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* DIN Condensed has no tabular figures, so the colon is the layout anchor:
            minutes grow leftward, seconds rightward, colon never moves */}
        <span
          ref={digitsRef}
          className="relative leading-none text-[#f6f6f3]"
          style={{
            fontFamily: 'var(--font-din-condensed)',
            fontWeight: 700,
            fontSize: 'clamp(96px, 24vw, 240px)',
            letterSpacing: '-0.02em',
          }}
        >
          :
          <span className="absolute right-full top-0 whitespace-nowrap">
            {timeText.split(':')[0]}
          </span>
          <span className="absolute left-full top-0 whitespace-nowrap">
            {timeText.split(':')[1]}
          </span>
        </span>

        <div className="flex items-center justify-center gap-8 md:gap-10">
          <button
            type="button"
            aria-label="Reset"
            onClick={handleReset}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: 'rgba(246,246,243,0.2)' }}
          >
            <ResetIcon />
          </button>
          <button
            type="button"
            aria-label={status === 'running' ? 'Pause' : 'Start'}
            onClick={handleStartPause}
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: 'rgba(246,246,243,0.2)' }}
          >
            {status === 'running' ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            aria-label="Skip"
            onClick={handleSkip}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: 'rgba(246,246,243,0.2)' }}
          >
            <SkipIcon />
          </button>
        </div>

        {/* Always mounted so the timer/controls above never re-center when this
            shows or hides — only its visibility toggles with phase/status */}
        <div className={`${chromeClass} ${phase === 'focus' && status !== 'idle' ? '' : 'invisible'}`}>
          <FocusExtendControl onExtend={handleExtendPulse} />
        </div>
      </div>

      {/* Scene picker — bottom center */}
      <div className={`absolute bottom-6 ${chromeClass}`}>
        <ScenePicker />
      </div>

      {showResetToast && (
        <ResetSessionToast
          onConfirm={handleResetSessionConfirm}
          onDismiss={() => setShowResetToast(false)}
        />
      )}

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      {justCompletedFocus && (
        <CompleteOverlay sessionsToday={sessionsToday} onDismiss={dismissComplete} />
      )}
    </main>
  )
}
