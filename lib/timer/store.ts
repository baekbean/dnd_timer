import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SCENE_ID } from '@/lib/timer/scenes'

export type Phase = 'focus' | 'shortBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerSettings {
  focusMin: number
  shortBreakMin: number
  /** Minutes added to the current focus session by the quick-extend button. */
  focusExtendMin: number
  /** Focus sessions per cycle — cyclePos wraps back to 0 after this many. */
  sessionsPerCycle: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  notifyOnComplete: boolean
}

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMin: 25,
  shortBreakMin: 5,
  focusExtendMin: 5,
  sessionsPerCycle: 4,
  autoStartBreaks: true,
  autoStartFocus: false,
  notifyOnComplete: false,
}

interface DailyLog {
  date: string // YYYY-MM-DD, local time
  completedSessions: number
}

interface TimerState {
  settings: TimerSettings
  phase: Phase
  status: TimerStatus
  /** Epoch ms when the current phase ends. Only set while running. */
  endAt: number | null
  /** Remaining time in ms — authoritative when idle/paused, refreshed by tick() while running. */
  remainingMs: number
  /** Position within the focus cycle (0-based). Wraps back to 0 after `sessionsPerCycle`. */
  cyclePos: number
  daily: DailyLog
  sceneId: string
  soundOn: boolean
  /** 0–1 */
  volume: number
  /** Bumped on every natural phase completion — UI watches this for chime/notification. */
  completions: number
  /** Phase that finished at the last natural completion. */
  lastCompletedPhase: Phase | null
  /** True right after a focus session completes naturally — drives the Complete screen. */
  justCompletedFocus: boolean

  start: () => void
  pause: () => void
  reset: () => void
  /** Resets the whole focus cycle back to the first focus segment. */
  resetSession: () => void
  skip: () => void
  tick: () => void
  updateSettings: (patch: Partial<TimerSettings>) => void
  applySettingsNow: (patch: Partial<TimerSettings>) => void
  /** Adds `minutes` to the current focus session's remaining time. No-op outside focus. */
  extendFocus: (minutes: number) => void
  setScene: (sceneId: string) => void
  setSoundOn: (on: boolean) => void
  setVolume: (volume: number) => void
  dismissComplete: () => void
  /** Reconcile persisted state with the wall clock after rehydration. */
  syncAfterLoad: () => void
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function phaseDurationMs(phase: Phase, settings: TimerSettings): number {
  const min = phase === 'focus' ? settings.focusMin : settings.shortBreakMin
  return Math.round(min * 60_000)
}

interface PhaseAdvance {
  phase: Phase
  cyclePos: number
  completedDelta: number
  autoStart: boolean
}

function nextPhase(
  state: Pick<TimerState, 'phase' | 'cyclePos' | 'settings'>,
  natural: boolean
): PhaseAdvance {
  if (state.phase === 'focus') {
    return {
      phase: 'shortBreak',
      cyclePos: state.cyclePos + 1,
      completedDelta: natural ? 1 : 0,
      autoStart: state.settings.autoStartBreaks,
    }
  }
  // A break that closes out a full cycle wraps the position back to the start
  const completesCycle = state.cyclePos % state.settings.sessionsPerCycle === 0
  return {
    phase: 'focus',
    cyclePos: completesCycle ? 0 : state.cyclePos,
    completedDelta: 0,
    autoStart: state.settings.autoStartFocus,
  }
}

function freshDaily(daily: DailyLog): DailyLog {
  return daily.date === todayKey() ? daily : { date: todayKey(), completedSessions: 0 }
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      phase: 'focus',
      status: 'idle',
      endAt: null,
      remainingMs: phaseDurationMs('focus', DEFAULT_SETTINGS),
      cyclePos: 0,
      daily: { date: todayKey(), completedSessions: 0 },
      sceneId: DEFAULT_SCENE_ID,
      soundOn: true,
      volume: 0.6,
      completions: 0,
      lastCompletedPhase: null,
      justCompletedFocus: false,

      start: () => {
        const s = get()
        if (s.status === 'running') return
        const remaining = s.remainingMs > 0 ? s.remainingMs : phaseDurationMs(s.phase, s.settings)
        set({ status: 'running', endAt: Date.now() + remaining, remainingMs: remaining })
      },

      pause: () => {
        const s = get()
        if (s.status !== 'running' || s.endAt === null) return
        set({
          status: 'paused',
          endAt: null,
          remainingMs: Math.max(0, s.endAt - Date.now()),
        })
      },

      reset: () => {
        const s = get()
        set({
          status: 'idle',
          endAt: null,
          remainingMs: phaseDurationMs(s.phase, s.settings),
        })
      },

      resetSession: () => {
        const s = get()
        set({
          phase: 'focus',
          cyclePos: 0,
          status: 'idle',
          endAt: null,
          remainingMs: phaseDurationMs('focus', s.settings),
        })
      },

      skip: () => {
        const s = get()
        const adv = nextPhase(s, false)
        const duration = phaseDurationMs(adv.phase, s.settings)
        set({
          phase: adv.phase,
          cyclePos: adv.cyclePos,
          status: adv.autoStart ? 'running' : 'idle',
          endAt: adv.autoStart ? Date.now() + duration : null,
          remainingMs: duration,
        })
      },

      tick: () => {
        const s = get()
        if (s.status !== 'running' || s.endAt === null) return
        const remaining = s.endAt - Date.now()
        if (remaining > 0) {
          set({ remainingMs: remaining })
          return
        }
        // Phase completed naturally
        const adv = nextPhase(s, true)
        const duration = phaseDurationMs(adv.phase, s.settings)
        const daily = freshDaily(s.daily)
        set({
          phase: adv.phase,
          cyclePos: adv.cyclePos,
          daily: { ...daily, completedSessions: daily.completedSessions + adv.completedDelta },
          status: adv.autoStart ? 'running' : 'idle',
          // Chain from the scheduled end, not from now, so no time is lost
          endAt: adv.autoStart ? s.endAt + duration : null,
          remainingMs: duration,
          completions: s.completions + 1,
          lastCompletedPhase: s.phase,
          justCompletedFocus: s.phase === 'focus' ? true : s.justCompletedFocus,
        })
      },

      updateSettings: (patch) => {
        const s = get()
        const settings = { ...s.settings, ...patch }
        // If the current phase hasn't started yet, adopt the new duration immediately
        const remainingMs =
          s.status === 'idle' ? phaseDurationMs(s.phase, settings) : s.remainingMs
        set({ settings, remainingMs })
      },

      /** Like updateSettings, but restarts the current phase's countdown from the new duration right away. */
      applySettingsNow: (patch) => {
        const s = get()
        const settings = { ...s.settings, ...patch }
        const remainingMs = phaseDurationMs(s.phase, settings)
        set({
          settings,
          remainingMs,
          endAt: s.status === 'running' ? Date.now() + remainingMs : null,
        })
      },

      extendFocus: (minutes) => {
        const s = get()
        if (s.phase !== 'focus') return
        const extraMs = Math.round(minutes * 60_000)
        if (s.status === 'running' && s.endAt !== null) {
          set({ endAt: s.endAt + extraMs, remainingMs: s.remainingMs + extraMs })
        } else {
          set({ remainingMs: s.remainingMs + extraMs })
        }
      },

      setScene: (sceneId) => set({ sceneId }),
      setSoundOn: (soundOn) => set({ soundOn }),
      setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
      dismissComplete: () => set({ justCompletedFocus: false }),

      syncAfterLoad: () => {
        const s = get()
        let { phase, cyclePos, status, endAt, remainingMs } = s
        const daily = freshDaily(s.daily)
        let completed = daily.completedSessions

        if (status === 'running') {
          if (endAt === null) {
            status = 'idle'
            remainingMs = phaseDurationMs(phase, s.settings)
          } else {
            // Replay any phases that ended while we were away
            while (endAt !== null && endAt <= Date.now()) {
              const adv = nextPhase({ phase, cyclePos, settings: s.settings }, true)
              phase = adv.phase
              cyclePos = adv.cyclePos
              completed += adv.completedDelta
              const duration = phaseDurationMs(phase, s.settings)
              remainingMs = duration
              if (adv.autoStart) {
                endAt = endAt + duration
              } else {
                endAt = null
                status = 'idle'
              }
            }
            if (endAt !== null) remainingMs = endAt - Date.now()
          }
        }

        set({
          phase,
          cyclePos,
          status,
          endAt,
          remainingMs,
          daily: { ...daily, completedSessions: completed },
          // New settings keys get defaults when rehydrating an older persisted shape
          settings: { ...DEFAULT_SETTINGS, ...s.settings },
          // Never resurface a stale Complete screen after a reload
          justCompletedFocus: false,
        })
      },
    }),
    {
      name: 'dnd-timer',
      skipHydration: true,
    }
  )
)
