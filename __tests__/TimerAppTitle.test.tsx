import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import TimerApp from '@/components/timer/TimerApp'
import { useTimerStore } from '@/lib/timer/store'
import { SITE_NAME, SITE_TITLE } from '@/lib/seo'

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))
// Scene backdrop renders <video>/iframe layers that jsdom can't drive.
vi.mock('@/components/timer/SceneBackground', () => ({ default: () => null }))

// In the real app, app/layout.tsx provides this at the root — Reshaped's
// Slider (rendered inside SettingsPanel/SoundPanel) needs a Theme context
// somewhere above it or it throws on mount.
function renderTimerApp() {
  return render(
    <Reshaped>
      <TimerApp />
    </Reshaped>
  )
}

describe('TimerApp document.title branding', () => {
  // The zustand store is a module-level singleton — reset it so the tests
  // don't depend on execution order.
  beforeEach(() => {
    act(() => {
      useTimerStore.getState().reset()
    })
  })

  it('uses the NookTimer site title while idle (regression: old "Do Not Disturb Timer" branding)', () => {
    renderTimerApp()
    expect(document.title).toBe(SITE_TITLE)
    expect(document.title).not.toContain('Do Not Disturb')
  })

  it('shows the countdown with NookTimer branding while running', () => {
    renderTimerApp()
    act(() => {
      useTimerStore.getState().start()
    })
    expect(document.title).toMatch(/^\d{2}:\d{2}/)
    expect(document.title.endsWith(`— ${SITE_NAME}`)).toBe(true)
  })
})
