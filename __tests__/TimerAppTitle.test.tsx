import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TimerApp from '@/components/timer/TimerApp'
import { useTimerStore } from '@/lib/timer/store'
import { SITE_NAME, SITE_TITLE } from '@/lib/seo'

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))
// Scene backdrop renders <video>/iframe layers that jsdom can't drive.
vi.mock('@/components/timer/SceneBackground', () => ({ default: () => null }))

describe('TimerApp document.title branding', () => {
  it('uses the NookTimer site title while idle (regression: old "Do Not Disturb Timer" branding)', () => {
    render(<TimerApp />)
    expect(document.title).toBe(SITE_TITLE)
    expect(document.title).not.toContain('Do Not Disturb')
  })

  it('shows the countdown with NookTimer branding while running', () => {
    render(<TimerApp />)
    act(() => {
      useTimerStore.getState().start()
    })
    expect(document.title).toMatch(/^\d{2}:\d{2}/)
    expect(document.title.endsWith(`— ${SITE_NAME}`)).toBe(true)
  })
})
