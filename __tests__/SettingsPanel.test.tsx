import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import SettingsPanel from '@/components/timer/SettingsPanel'
import { DEFAULT_SETTINGS, useTimerStore } from '@/lib/timer/store'
import {
  trackDurationPresetClick,
  trackSettingsSaved,
  trackSettingsToggleChange,
} from '@/lib/ga'

vi.mock('@/lib/ga', () => ({
  trackDurationPresetClick: vi.fn(),
  trackSettingsSaved: vi.fn(),
  trackSettingsToggleChange: vi.fn(),
  trackFeedbackClick: vi.fn(),
  trackFeedbackSubmit: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

// Reshaped's Slider (rendered elsewhere in this panel) needs a Theme context
// somewhere above it or it throws on mount.
function renderPanel(onClose = vi.fn()) {
  render(
    <Reshaped>
      <SettingsPanel onClose={onClose} />
    </Reshaped>
  )
  return onClose
}

describe('SettingsPanel analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useTimerStore.getState().reset?.()
  })

  it('tracks a duration preset click without also firing for manual typing', () => {
    renderPanel()

    fireEvent.click(screen.getByRole('button', { name: '60' }))

    expect(trackDurationPresetClick).toHaveBeenCalledWith({ field: 'focus', value: 60 })
    expect(trackDurationPresetClick).toHaveBeenCalledTimes(1)

    // Manual typing goes through the same onChange, but must not count as a "click".
    vi.mocked(trackDurationPresetClick).mockClear()
    const focusInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement
    fireEvent.change(focusInput, { target: { value: '45' } })

    expect(trackDurationPresetClick).not.toHaveBeenCalled()
  })

  it('tracks which field a preset click belongs to for Break and Sessions too', () => {
    renderPanel()

    fireEvent.click(screen.getByRole('button', { name: '15' })) // Break preset
    expect(trackDurationPresetClick).toHaveBeenCalledWith({ field: 'break', value: 15 })

    fireEvent.click(screen.getByRole('button', { name: '3' })) // Sessions preset
    expect(trackDurationPresetClick).toHaveBeenCalledWith({ field: 'sessions', value: 3 })
  })

  it('tracks Auto-start toggle changes', () => {
    renderPanel()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Auto-start breaks' }))
    expect(trackSettingsToggleChange).toHaveBeenCalledWith({
      field: 'auto_start_breaks',
      value: false,
    })

    fireEvent.click(screen.getByRole('checkbox', { name: 'Auto-start focus' }))
    expect(trackSettingsToggleChange).toHaveBeenCalledWith({
      field: 'auto_start_focus',
      value: true,
    })
  })

  it('tracks settings_saved with the changed fields when closed with pending duration changes', () => {
    renderPanel()

    fireEvent.click(screen.getByRole('button', { name: '50' })) // Focus preset
    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }))

    expect(trackSettingsSaved).toHaveBeenCalledWith({ focusMin: 50 })
  })

  it('does not track settings_saved when closed without any changes', () => {
    renderPanel()

    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }))

    expect(trackSettingsSaved).not.toHaveBeenCalled()
  })

  it('tracks the Notify toggle only when it actually takes effect', () => {
    renderPanel()

    // jsdom has no Notification API, so the permission-gate branch is skipped
    // and the toggle takes effect immediately.
    fireEvent.click(screen.getByRole('checkbox', { name: 'Notify when session ends' }))

    expect(trackSettingsToggleChange).toHaveBeenCalledWith({
      field: 'notify_on_complete',
      value: true,
    })
    expect(useTimerStore.getState().settings.notifyOnComplete).toBe(true)
  })
})

describe('SettingsPanel pending-change modal (mid-session duration edits)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useTimerStore.getState().reset?.()
    // `reset()` only clears the current run (status/endAt/remainingMs) — it
    // deliberately leaves `settings` alone, so a prior test's committed
    // duration change would otherwise leak into this one. Pin the full
    // settings object explicitly rather than relying on reset() for it.
    useTimerStore.setState({
      status: 'running',
      phase: 'focus',
      remainingMs: 10 * 60_000,
      settings: { ...DEFAULT_SETTINGS },
    })
  })

  it('asks before applying a change to the current phase, and Apply now restarts the countdown immediately', () => {
    renderPanel()

    fireEvent.click(screen.getByRole('button', { name: '50' })) // Focus preset -> 50 min
    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }))

    // Closing didn't take effect yet — the pending prompt gates it
    expect(screen.getByText(/Apply the new time to your current session/)).toBeTruthy()
    expect(useTimerStore.getState().settings.focusMin).toBe(25)

    fireEvent.click(screen.getByRole('button', { name: 'Apply now' }))

    expect(useTimerStore.getState().settings.focusMin).toBe(50)
    // Apply-now restarts the running phase's countdown from the new duration
    expect(useTimerStore.getState().remainingMs).toBe(50 * 60_000)
    expect(trackSettingsSaved).toHaveBeenCalledWith({ focusMin: 50, apply_mode: 'now' })
  })

  it('applies the setting for later but leaves the current countdown untouched when Apply next session is chosen', () => {
    renderPanel()

    fireEvent.click(screen.getByRole('button', { name: '50' })) // Focus preset -> 50 min
    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply next session' }))

    // The setting itself is updated for the next time this phase starts...
    expect(useTimerStore.getState().settings.focusMin).toBe(50)
    // ...but the session already in progress keeps counting down from what it had
    expect(useTimerStore.getState().remainingMs).toBe(10 * 60_000)
    expect(trackSettingsSaved).toHaveBeenCalledWith({ focusMin: 50, apply_mode: 'next' })
  })

  it('does not prompt for a change to a phase other than the one currently running', () => {
    renderPanel()

    // Break preset, while a focus session is running — takes effect immediately,
    // same as always, since it doesn't touch the phase in progress.
    fireEvent.click(screen.getByRole('button', { name: '15' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }))

    expect(screen.queryByText(/Apply the new time to your current session/)).toBeNull()
    expect(useTimerStore.getState().settings.shortBreakMin).toBe(15)
  })
})
