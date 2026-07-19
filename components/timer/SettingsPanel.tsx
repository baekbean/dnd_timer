'use client'

import { useEffect, useRef, useState } from 'react'
import { submitFeedbackSilently } from '@/lib/constants'
import { trackFeedbackClick, trackFeedbackSubmit } from '@/lib/ga'
import { useTimerStore, type TimerSettings, type Phase } from '@/lib/timer/store'
import posthog from 'posthog-js'

type TimingKey = 'focusMin' | 'shortBreakMin' | 'sessionsPerCycle'
type TimingDraft = Pick<TimerSettings, TimingKey>
type DurationKey = 'focusMin' | 'shortBreakMin'

const PHASE_TO_TIMING_KEY: Record<Phase, DurationKey> = {
  focus: 'focusMin',
  shortBreak: 'shortBreakMin',
}

const TIMING_KEYS: TimingKey[] = ['focusMin', 'shortBreakMin', 'sessionsPerCycle']

function diffTiming(draft: TimingDraft, settings: TimerSettings): Partial<TimingDraft> {
  const patch: Partial<TimingDraft> = {}
  for (const key of TIMING_KEYS) {
    if (draft[key] !== settings[key]) patch[key] = draft[key]
  }
  return patch
}

interface Props {
  onClose: () => void
}

function DurationField({
  label,
  value,
  min,
  max,
  presets,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  presets?: number[]
  onChange: (v: number) => void
}) {
  // Local, freely-editable text so the field can sit empty or mid-typed without
  // being clamped back on every keystroke. Only finalized (clamped) on blur.
  const [text, setText] = useState(String(value))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep editable input text in sync with preset buttons.
    setText(String(value))
  }, [value])

  const commit = () => {
    const parsed = Number(text)
    const clamped =
      text.trim() === '' || !Number.isFinite(parsed)
        ? min
        : Math.min(max, Math.max(min, Math.round(parsed)))
    setText(String(clamped))
    onChange(clamped)
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 font-pretendard text-[15px] text-[#343434]">{label}</span>
      <div className="flex items-center gap-2">
        {presets && presets.length > 0 && (
          <div className="flex gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className="rounded-full bg-[rgba(52,52,52,0.06)] px-2 py-1 font-pretendard text-[12px] text-[rgba(52,52,52,0.7)] outline-none transition-colors hover:bg-[rgba(52,52,52,0.12)] active:bg-[#74856E] active:text-white"
              >
                {preset}
              </button>
            ))}
          </div>
        )}
        <input
          type="number"
          inputMode="numeric"
          value={text}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '' || /^\d+$/.test(raw)) {
              setText(raw)
              if (raw !== '') onChange(Number(raw))
            }
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
          className="w-20 shrink-0 rounded-lg border border-[#343434]/15 bg-[#F6F6F3] px-2 py-1.5 text-right font-pretendard text-[15px] text-[#343434] outline-none focus:border-[#343434]/40 [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
          style={{ MozAppearance: 'textfield' }}
        />
      </div>
    </div>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="font-pretendard text-[15px] text-[#343434]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-7 w-12 rounded-full transition-colors"
        style={{ background: checked ? '#74856E' : 'rgba(52,52,52,0.2)' }}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: checked ? 'calc(100% - 24px)' : '4px' }}
        />
      </button>
    </label>
  )
}

function VolumeField() {
  const volume = useTimerStore((s) => s.volume)
  const setVolume = useTimerStore((s) => s.setVolume)

  return (
    <label className="flex items-center justify-between gap-4">
      <span className="font-pretendard text-[15px] text-[#343434]">Volume</span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(volume * 100)}
        onChange={(e) => setVolume(Number(e.target.value) / 100)}
        className="w-40 accent-[#74856E]"
      />
    </label>
  )
}

function FeedbackLink() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <p className="pt-1 text-center font-pretendard text-[13px] text-[#343434]/55">
        Thanks for the feedback!
      </p>
    )
  }

  if (!open) {
    return (
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={() => {
            trackFeedbackClick({ button_location: 'settings', page: 'timer' })
            setOpen(true)
          }}
          className="font-pretendard text-[13px] text-[#343434]/55 underline underline-offset-4 transition-colors hover:text-[#343434]"
        >
          Send feedback
        </button>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    trackFeedbackSubmit({ page: 'timer' })
    posthog.capture('feedback_submit', { page: 'timer' })
    submitFeedbackSilently(text)
    setSent(true)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-1">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full resize-none rounded-lg border border-[#343434]/15 bg-[#F6F6F3] px-3 py-2 font-pretendard text-[14px] text-[#343434] outline-none focus:border-[#343434]/40"
      />
      <button
        type="submit"
        className="self-center rounded-full bg-[#343434] px-5 py-2 font-pretendard text-[13px] text-[#F6F6F3] transition-opacity hover:opacity-80"
      >
        Send
      </button>
    </form>
  )
}

export default function SettingsPanel({ onClose }: Props) {
  const settings = useTimerStore((s) => s.settings)
  const status = useTimerStore((s) => s.status)
  const phase = useTimerStore((s) => s.phase)
  const updateSettings = useTimerStore((s) => s.updateSettings)
  const applySettingsNow = useTimerStore((s) => s.applySettingsNow)

  const set = (patch: Partial<TimerSettings>) => updateSettings(patch)

  const [draft, setDraft] = useState<TimingDraft>({
    focusMin: settings.focusMin,
    shortBreakMin: settings.shortBreakMin,
    sessionsPerCycle: settings.sessionsPerCycle,
  })
  // Mirrors `draft` synchronously so requestClose can read the latest value right after
  // forcing a blur, without waiting on React's render cycle.
  const draftRef = useRef(draft)
  const setDraftField = (patch: Partial<TimingDraft>) =>
    setDraft((d) => {
      const next = { ...d, ...patch }
      draftRef.current = next
      return next
    })

  const [pending, setPending] = useState<Partial<TimingDraft> | null>(null)

  // Timing changes are drafts — nothing is committed until the panel is closed (X or backdrop).
  // Blur the focused field first so its final (clamped) value lands in draftRef before we diff.
  const requestClose = () => {
    const active = document.activeElement
    if (active instanceof HTMLElement) active.blur()
    const patch = diffTiming(draftRef.current, settings)
    if (Object.keys(patch).length === 0) {
      onClose()
      return
    }

    const isActive = status === 'running' || status === 'paused'
    const touchesCurrentPhase = PHASE_TO_TIMING_KEY[phase] in patch

    if (isActive && touchesCurrentPhase) {
      setPending(patch)
      return
    }

    updateSettings(patch)
    posthog.capture('settings_saved', patch)
    onClose()
  }

  const resolvePending = (mode: 'now' | 'next') => {
    if (pending) {
      if (mode === 'now') {
        applySettingsNow(pending)
      } else {
        updateSettings(pending)
      }
      posthog.capture('settings_saved', { ...pending, apply_mode: mode })
    }
    setPending(null)
    onClose()
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-4"
      onClick={requestClose}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-aspekta text-[18px] uppercase text-[#343434]">Settings</h2>
          <button
            type="button"
            aria-label="Close settings"
            onClick={requestClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#343434]/5"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="#343434" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <DurationField
            label="Focus"
            value={draft.focusMin}
            min={1}
            max={9999}
            presets={[60, 50, 30, 25]}
            onChange={(v) => setDraftField({ focusMin: v })}
          />
          <DurationField
            label="Break"
            value={draft.shortBreakMin}
            min={1}
            max={9999}
            presets={[15, 10, 5]}
            onChange={(v) => setDraftField({ shortBreakMin: v })}
          />
          <DurationField
            label="Sessions"
            value={draft.sessionsPerCycle}
            min={1}
            max={8}
            presets={[4, 3, 2, 1]}
            onChange={(v) => setDraftField({ sessionsPerCycle: v })}
          />

          <div className="my-1 h-px bg-[#343434]/10" />

          <VolumeField />

          <div className="my-1 h-px bg-[#343434]/10" />

          <ToggleField
            label="Auto-start breaks"
            checked={settings.autoStartBreaks}
            onChange={(v) => set({ autoStartBreaks: v })}
          />
          <ToggleField
            label="Auto-start focus"
            checked={settings.autoStartFocus}
            onChange={(v) => set({ autoStartFocus: v })}
          />
          <ToggleField
            label="Notify when session ends"
            checked={settings.notifyOnComplete}
            onChange={async (v) => {
              if (v && typeof Notification !== 'undefined' && Notification.permission === 'default') {
                const result = await Notification.requestPermission()
                if (result !== 'granted') return
              }
              set({ notifyOnComplete: v })
            }}
          />

          <FeedbackLink />
        </div>
      </div>

      {pending && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 p-4"
          onClick={() => resolvePending('next')}
        >
          <div
            className="w-full max-w-[340px] rounded-2xl bg-white p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-5 font-pretendard text-[15px] leading-relaxed text-[#343434]">
              Apply the new time to your current session right now, or wait until the next session?
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => resolvePending('now')}
                className="rounded-lg bg-[#74856E] px-4 py-2 font-pretendard text-[14px] text-white transition-opacity hover:opacity-90"
              >
                Apply now
              </button>
              <button
                type="button"
                onClick={() => resolvePending('next')}
                className="rounded-lg border border-[#343434]/15 px-4 py-2 font-pretendard text-[14px] text-[#343434] transition-colors hover:bg-[#343434]/5"
              >
                Apply next session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
