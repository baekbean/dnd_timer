'use client'

import { useEffect, useRef, useState } from 'react'
import { useTimerStore, type Phase } from '@/lib/timer/store'
import {
  trackTimerStart,
  trackSessionComplete,
  trackSessionAbandon,
  trackFullscreenEnter,
  trackSoundToggle,
} from '@/lib/ga'
import { getScene, SCENES } from '@/lib/timer/scenes'
import { soundEngine } from '@/lib/timer/sound'
import { useWakeLock } from '@/lib/timer/useWakeLock'
import { useIdleHide } from '@/lib/timer/useIdleHide'
import { formatTime, getDigitScale } from '@/lib/timer/formatTime'
import { trackSceneChange } from '@/lib/ga'
import YoutubeSceneBackground from '@/components/timer-test/YoutubeSceneBackground'
import SettingsPanelFeather from '@/components/timer-test/SettingsPanelFeather'
import ScenePickerFeather from '@/components/timer-test/ScenePickerFeather'
import CompleteOverlayFeather from '@/components/timer-test/CompleteOverlayFeather'

const PHASE_LABEL: Record<Phase, string> = {
  focus: 'Focus',
  shortBreak: 'Short break',
}

const INK = '#343434'

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M4 2L15 9L4 16V2Z" fill={INK} />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 16 18" fill="none">
      <rect x="1" y="1" width="5" height="16" rx="2" fill={INK} />
      <rect x="10" y="1" width="5" height="16" rx="2" fill={INK} />
    </svg>
  )
}

function SkipIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M1 1L8 6L1 11V1Z" fill={INK} />
      <rect x="9" y="1" width="2" height="10" rx="1" fill={INK} />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path
        d="M12.25 7A5.25 5.25 0 1 1 7 1.75c1.98 0 3.7 1.1 4.6 2.72"
        stroke={INK}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M11.9 1.4v3.2H8.7" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke={INK} strokeWidth="1.6" />
      <path
        d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-.97 1.47V21a2 2 0 1 1-4 0v-.09a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.47-.97H3a2 2 0 1 1 0-4h.09A1.6 1.6 0 0 0 4.56 9a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 8.84 4.7 1.6 1.6 0 0 0 9.81 3.23V3a2 2 0 1 1 4 0v.09c0 .64.38 1.21.97 1.47.6.25 1.28.13 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.77c.26.59.83.97 1.47.97H21a2 2 0 1 1 0 4h-.09c-.64 0-1.21.38-1.47.97Z"
        stroke={INK}
        strokeWidth="1.6"
      />
    </svg>
  )
}

function FullscreenIcon({ active }: { active: boolean }) {
  const d = active ? 'M6 1v5H1M10 1v5h5M6 15v-5H1M10 15v-5h5' : 'M1 6V1h5M15 6V1h-5M1 10v5h5M15 10v5h-5'
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d={d} stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg width="13" height="12" viewBox="0 0 14 12" fill="none">
      <path d="M1 4h2.5L7 1v10L3.5 8H1V4Z" fill={INK} />
      <path d="M10 4.2c.9.7.9 2.9 0 3.6" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
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

function PaperButton({
  onClick,
  ariaLabel,
  size = 44,
  children,
}: {
  onClick: () => void
  ariaLabel: string
  size?: number
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex items-center justify-center rounded-full transition-transform hover:-translate-y-0.5"
      style={{
        width: size,
        height: size,
        background: '#FEFEFB',
        boxShadow: '0 4px 12px rgba(52,52,52,0.16)',
      }}
    >
      {children}
    </button>
  )
}

// Fixed-width digit slots so the colon stays centered and the card never
// resizes as digits change (DIN Condensed has no tabular figures).
function TimeDisplay({ text, fontSize }: { text: string; fontSize: string }) {
  return (
    <span
      className="inline-flex leading-none"
      style={{
        fontFamily: 'var(--font-din-condensed)',
        fontWeight: 700,
        fontSize,
        letterSpacing: '-0.02em',
        color: INK,
      }}
    >
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className="inline-block text-center"
          style={{ width: ch === ':' ? '0.36em' : '0.74em' }}
        >
          {ch}
        </span>
      ))}
    </span>
  )
}

export default function TimerAppFeather() {
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
  const setScene = useTimerStore((s) => s.setScene)
  const settings = useTimerStore((s) => s.settings)
  const completions = useTimerStore((s) => s.completions)
  const lastCompletedPhase = useTimerStore((s) => s.lastCompletedPhase)
  const justCompletedFocus = useTimerStore((s) => s.justCompletedFocus)
  const dismissComplete = useTimerStore((s) => s.dismissComplete)
  const sessionsToday = useTimerStore((s) => s.daily.completedSessions)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
  const scene = getScene(sceneId)
  const isIdle = status === 'idle'

  const chromeHidden = useIdleHide(status === 'running' && !settingsOpen && !justCompletedFocus)
  const chromeClass = `transition-opacity duration-700 ${
    chromeHidden ? 'pointer-events-none opacity-0' : 'opacity-100'
  }`

  useEffect(() => {
    useTimerStore.persist.rehydrate()
    useTimerStore.getState().syncAfterLoad()
  }, [])

  useEffect(() => {
    const unlock = () => soundEngine.resume()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [status, tick])

  useWakeLock(status === 'running')

  useEffect(() => {
    if (status === 'running' && soundOn) {
      soundEngine.startAmbient(getScene(sceneId))
      return () => soundEngine.stopAmbient()
    }
  }, [status, soundOn, sceneId])

  useEffect(() => {
    soundEngine.setVolume(volume)
  }, [volume])

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

  const timeText = formatTime(remainingMs)
  const digitScale = getDigitScale(timeText)
  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      document.title = `${timeText} · ${PHASE_LABEL[phase]} — Do Not Disturb Timer`
    } else {
      document.title = 'Do Not Disturb Timer (concept)'
    }
    return () => {
      document.title = 'Do Not Disturb Timer'
    }
  }, [timeText, status, phase])

  const stickerScenes = SCENES.slice(0, 3)

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden"
      style={{ cursor: chromeHidden ? 'none' : 'auto' }}
    >
      <YoutubeSceneBackground scene={scene} />

      {/* Sound — top left */}
      <div className={`absolute left-6 top-6 z-10 ${chromeClass}`}>
        <button
          type="button"
          aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
          aria-pressed={soundOn}
          onClick={() => {
            trackSoundToggle({ sound_on: !soundOn })
            setSoundOn(!soundOn)
          }}
          className="flex items-center gap-2 rounded-full px-3 py-2 transition-transform hover:-translate-y-0.5"
          style={{ background: '#FEFEFB', boxShadow: '0 4px 12px rgba(52,52,52,0.16)', opacity: soundOn ? 1 : 0.6 }}
        >
          <SpeakerIcon />
          <span className="text-[12px] leading-none" style={{ color: INK, fontFamily: 'var(--font-pretendard)' }}>
            {soundOn ? 'Sound' : 'Muted'}
          </span>
        </button>
      </div>

      {/* Fullscreen + settings — top right */}
      <div className={`absolute right-6 top-6 z-10 flex items-center gap-3 ${chromeClass}`}>
        <PaperButton ariaLabel={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={handleFullscreen} size={40}>
          <FullscreenIcon active={isFullscreen} />
        </PaperButton>
        <PaperButton ariaLabel="Settings" onClick={() => setSettingsOpen(true)} size={40}>
          <GearIcon />
        </PaperButton>
      </div>

      {isIdle ? (
        /* Idle — paper desk collage, doubles as the app's "hero" moment */
        <div
          className="relative flex w-[min(92vw,640px)] flex-col items-center px-6 py-16"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        >
          <div
            className="relative flex flex-col items-center gap-3 px-10 py-8"
            style={{
              background: '#FEFEFB',
              borderRadius: '6px 6px 6px 22px',
              boxShadow: '0 20px 44px rgba(0,0,0,0.22)',
              transform: 'rotate(-1.2deg)',
            }}
          >
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
              style={{ background: '#E4E9DE', color: '#4C5A45' }}
            >
              {phaseLabel.toUpperCase()}
            </span>
            <TimeDisplay
              text={timeText}
              fontSize={`clamp(${Math.round(64 * digitScale)}px, ${(16 * digitScale).toFixed(2)}vw, ${Math.round(120 * digitScale)}px)`}
            />
            <button
              type="button"
              onClick={handleStartPause}
              className="mt-1 rounded-full px-6 py-2.5 text-[14px] font-medium transition-transform hover:-translate-y-0.5"
              style={{ background: '#74856E', color: '#F6F6F3' }}
            >
              Start focusing
            </button>
          </div>

          {/* Scattered scene stickers */}
          <div
            className="absolute left-2 top-4 hidden sm:block"
            style={{ transform: 'rotate(-4deg)' }}
          >
            <button
              type="button"
              aria-label={`Scene: ${stickerScenes[0].name}`}
              onClick={() => {
                if (stickerScenes[0].id !== sceneId) trackSceneChange({ scene_id: stickerScenes[0].id })
                setScene(stickerScenes[0].id)
              }}
              className="flex flex-col gap-1 rounded-[8px] px-3 py-2 text-left"
              style={{ background: '#FEFEFB', boxShadow: '0 6px 16px rgba(52,52,52,0.14)' }}
            >
              <span className="text-[10px]" style={{ color: '#9a988e' }}>
                SCENE
              </span>
              <span className="text-[13px] font-medium" style={{ color: INK }}>
                {stickerScenes[0].name}
              </span>
            </button>
          </div>

          <div
            className="absolute right-2 top-8 hidden sm:block"
            style={{ transform: 'rotate(3deg)' }}
          >
            <button
              type="button"
              aria-label={`Scene: ${stickerScenes[1].name}`}
              onClick={() => {
                if (stickerScenes[1].id !== sceneId) trackSceneChange({ scene_id: stickerScenes[1].id })
                setScene(stickerScenes[1].id)
              }}
              className="flex flex-col gap-1 rounded-[8px] px-3 py-2 text-left"
              style={{ background: '#FEFEFB', boxShadow: '0 6px 16px rgba(52,52,52,0.14)' }}
            >
              <span className="text-[10px]" style={{ color: '#9a988e' }}>
                SCENE
              </span>
              <span className="text-[13px] font-medium" style={{ color: INK }}>
                {stickerScenes[1].name}
              </span>
            </button>
          </div>

          <div
            className="absolute bottom-6 left-6 hidden md:block max-w-[150px] rounded-[8px] px-4 py-3"
            style={{ background: '#FEFEFB', boxShadow: '0 6px 16px rgba(52,52,52,0.14)', transform: 'rotate(2deg)' }}
          >
            <span className="text-[13px] font-medium leading-snug" style={{ color: '#4C5A45' }}>
              Romanticize your focus.
            </span>
          </div>

          <div
            className="absolute bottom-8 right-4 hidden sm:block"
            style={{ transform: 'rotate(-3deg)' }}
          >
            <button
              type="button"
              aria-label={`Scene: ${stickerScenes[2].name}`}
              onClick={() => {
                if (stickerScenes[2].id !== sceneId) trackSceneChange({ scene_id: stickerScenes[2].id })
                setScene(stickerScenes[2].id)
              }}
              className="flex flex-col gap-1 rounded-[8px] px-3 py-2 text-left"
              style={{ background: '#FEFEFB', boxShadow: '0 6px 16px rgba(52,52,52,0.14)' }}
            >
              <span className="text-[10px]" style={{ color: '#9a988e' }}>
                SCENE
              </span>
              <span className="text-[13px] font-medium" style={{ color: INK }}>
                {stickerScenes[2].name}
              </span>
            </button>
          </div>

          {/* Scattered stickers are hidden on narrow screens — fall back to a compact row */}
          <div className="mt-6 sm:hidden">
            <ScenePickerFeather compact />
          </div>
        </div>
      ) : (
        /* Running / paused — quiet floating card over the ambient scene */
        <div className="flex flex-col items-center gap-8">
          <div
            className="flex flex-col items-center gap-2 px-10 py-7"
            style={{
              background: 'rgba(254,254,251,0.88)',
              backdropFilter: 'blur(6px)',
              borderRadius: '6px 6px 6px 20px',
              boxShadow: '0 16px 36px rgba(0,0,0,0.18)',
            }}
          >
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
              style={{ background: '#E4E9DE', color: '#4C5A45' }}
            >
              {phaseLabel.toUpperCase()}
            </span>
            <TimeDisplay
              text={timeText}
              fontSize={`clamp(${Math.round(72 * digitScale)}px, ${(18 * digitScale).toFixed(2)}vw, ${Math.round(160 * digitScale)}px)`}
            />
          </div>

          <div className={`flex items-center justify-center gap-6 ${chromeClass}`}>
            <PaperButton ariaLabel="Reset" onClick={handleReset} size={44}>
              <ResetIcon />
            </PaperButton>
            <PaperButton ariaLabel={status === 'running' ? 'Pause' : 'Start'} onClick={handleStartPause} size={64}>
              {status === 'running' ? <PauseIcon /> : <PlayIcon />}
            </PaperButton>
            <PaperButton ariaLabel="Skip" onClick={handleSkip} size={44}>
              <SkipIcon />
            </PaperButton>
          </div>
        </div>
      )}

      {/* Scene picker — bottom center, only while running/paused (idle shows scattered stickers instead) */}
      {!isIdle && (
        <div className={`absolute bottom-6 z-10 ${chromeClass}`}>
          <ScenePickerFeather compact />
        </div>
      )}

      {settingsOpen && <SettingsPanelFeather onClose={() => setSettingsOpen(false)} />}
      {justCompletedFocus && (
        <CompleteOverlayFeather sessionsToday={sessionsToday} onDismiss={dismissComplete} />
      )}
    </main>
  )
}
