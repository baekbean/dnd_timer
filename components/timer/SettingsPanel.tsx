'use client'

import { useEffect, useRef, useState } from 'react'
import { Button, Modal, Switch } from 'reshaped'
import { submitFeedbackSilently } from '@/lib/constants'
import {
  trackDurationPresetClick,
  trackFeedbackClick,
  trackFeedbackSubmit,
  trackSettingsSaved,
  trackSettingsToggleChange,
} from '@/lib/ga'
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
  onPresetClick,
}: {
  label: string
  value: number
  min: number
  max: number
  presets?: number[]
  onChange: (v: number) => void
  /** Fired only for the preset shortcut chips, not manual typing into the field. */
  onPresetClick?: (v: number) => void
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
              <Button
                key={preset}
                onClick={() => {
                  onChange(preset)
                  onPresetClick?.(preset)
                }}
                size="small"
                variant="outline"
              >
                {preset}
              </Button>
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
  name,
  checked,
  onChange,
}: {
  label: string
  name: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-pretendard text-[15px] text-[#343434]">{label}</span>
      <Switch
        name={name}
        checked={checked}
        onChange={({ checked }) => onChange(checked)}
        inputAttributes={{ 'aria-label': label }}
      />
    </div>
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
    trackSettingsSaved(patch)
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
      trackSettingsSaved({ ...pending, apply_mode: mode })
      posthog.capture('settings_saved', { ...pending, apply_mode: mode })
    }
    setPending(null)
    onClose()
  }

  return (
    <>
      <Modal active onClose={requestClose} ariaLabel="Settings">
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
            onPresetClick={(v) => {
              trackDurationPresetClick({ field: 'focus', value: v })
              posthog.capture('duration_preset_click', { field: 'focus', value: v })
            }}
          />
          <DurationField
            label="Break"
            value={draft.shortBreakMin}
            min={1}
            max={9999}
            presets={[15, 10, 5]}
            onChange={(v) => setDraftField({ shortBreakMin: v })}
            onPresetClick={(v) => {
              trackDurationPresetClick({ field: 'break', value: v })
              posthog.capture('duration_preset_click', { field: 'break', value: v })
            }}
          />
          <DurationField
            label="Sessions"
            value={draft.sessionsPerCycle}
            min={1}
            max={8}
            presets={[4, 3, 2, 1]}
            onChange={(v) => setDraftField({ sessionsPerCycle: v })}
            onPresetClick={(v) => {
              trackDurationPresetClick({ field: 'sessions', value: v })
              posthog.capture('duration_preset_click', { field: 'sessions', value: v })
            }}
          />

          <div className="my-1 h-px bg-[#343434]/10" />

          <ToggleField
            label="Auto-start breaks"
            name="auto-start-breaks"
            checked={settings.autoStartBreaks}
            onChange={(v) => {
              trackSettingsToggleChange({ field: 'auto_start_breaks', value: v })
              posthog.capture('settings_toggle_change', { field: 'auto_start_breaks', value: v })
              set({ autoStartBreaks: v })
            }}
          />
          <ToggleField
            label="Auto-start focus"
            name="auto-start-focus"
            checked={settings.autoStartFocus}
            onChange={(v) => {
              trackSettingsToggleChange({ field: 'auto_start_focus', value: v })
              posthog.capture('settings_toggle_change', { field: 'auto_start_focus', value: v })
              set({ autoStartFocus: v })
            }}
          />
          <ToggleField
            label="Notify when session ends"
            name="notify-on-complete"
            checked={settings.notifyOnComplete}
            onChange={async (v) => {
              if (v && typeof Notification !== 'undefined' && Notification.permission === 'default') {
                const result = await Notification.requestPermission()
                if (result !== 'granted') return
              }
              trackSettingsToggleChange({ field: 'notify_on_complete', value: v })
              posthog.capture('settings_toggle_change', { field: 'notify_on_complete', value: v })
              set({ notifyOnComplete: v })
            }}
          />

          <FeedbackLink />
        </div>
      </Modal>

      {pending && (
        <Modal active onClose={() => resolvePending('next')} ariaLabel="Apply new time">
          <p className="mb-5 font-pretendard text-[15px] leading-relaxed text-[#343434]">
            Apply the new time to your current session right now, or wait until the next session?
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => resolvePending('now')} color="primary">
              Apply now
            </Button>
            <Button onClick={() => resolvePending('next')} variant="outline">
              Apply next session
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
