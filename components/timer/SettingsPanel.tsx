'use client'

import { useTimerStore, type TimerSettings } from '@/lib/timer/store'

interface Props {
  onClose: () => void
}

function DurationField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="font-pretendard text-[15px] text-[#343434]">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, Math.round(v))))
        }}
        className="w-20 rounded-lg border border-[#343434]/15 bg-[#F6F6F3] px-3 py-2 text-right font-pretendard text-[15px] text-[#343434] outline-none focus:border-[#343434]/40"
      />
    </label>
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

export default function SettingsPanel({ onClose }: Props) {
  const settings = useTimerStore((s) => s.settings)
  const updateSettings = useTimerStore((s) => s.updateSettings)

  const set = (patch: Partial<TimerSettings>) => updateSettings(patch)

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
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
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#343434]/5"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="#343434" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <DurationField
            label="Focus (minutes)"
            value={settings.focusMin}
            min={1}
            max={120}
            onChange={(v) => set({ focusMin: v })}
          />
          <DurationField
            label="Short break (minutes)"
            value={settings.shortBreakMin}
            min={1}
            max={60}
            onChange={(v) => set({ shortBreakMin: v })}
          />
          <DurationField
            label="Long break (minutes)"
            value={settings.longBreakMin}
            min={1}
            max={90}
            onChange={(v) => set({ longBreakMin: v })}
          />
          <DurationField
            label="Sessions until long break"
            value={settings.sessionsUntilLongBreak}
            min={2}
            max={8}
            onChange={(v) => set({ sessionsUntilLongBreak: v })}
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
        </div>
      </div>
    </div>
  )
}
