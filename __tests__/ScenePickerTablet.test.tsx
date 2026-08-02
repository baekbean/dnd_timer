import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import ScenePicker from '@/components/timer/ScenePicker'
import { DEFAULT_CUSTOM_YOUTUBE_ID, DEFAULT_SCENE_ID } from '@/lib/timer/scenes'
import { useTimerStore } from '@/lib/timer/store'

// An iPad (or any tablet) has an on-screen keyboard just like a phone, but
// lib/deviceType.ts classifies it as 'tablet', not 'mobile' — before this
// fix, that meant it fell through to the bottom-anchored Popover variant
// (which has no way to react to the keyboard) instead of the keyboard-aware
// Modal dialog. See ScenePicker.tsx's `hasSoftKeyboard`/`variant`
// calculation. This is a regression test: it fails against the pre-fix
// `variant` calc, which only checked `deviceType === 'mobile'`.
vi.mock('@/lib/timer/useDeviceType', () => ({ useDeviceType: () => 'tablet' }))

vi.mock('@/lib/ga', () => ({
  trackSceneChange: vi.fn(),
  trackSceneExposure: vi.fn(),
  trackCustomSceneEditorOpen: vi.fn(),
  trackCustomSceneSet: vi.fn(),
  trackCustomSceneInvalidUrl: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

function renderPicker() {
  return render(
    <Reshaped>
      <ScenePicker />
    </Reshaped>
  )
}

// Same outside-click quirk as ScenePicker.test.tsx's `click()` helper.
function click(el: Element) {
  fireEvent.mouseDown(el)
  fireEvent.click(el)
}

describe('ScenePicker on a tablet-classified device', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useTimerStore.setState({
      sceneId: DEFAULT_SCENE_ID,
      customYoutubeId: DEFAULT_CUSTOM_YOUTUBE_ID,
    })
  })

  it('opens the background-video editor as a dialog instead of a bottom-anchored popover', () => {
    renderPicker()

    click(screen.getByRole('button', { name: 'Change background video' }))

    // Reshaped's Modal renders its own top-level aria-modal dialog landmark —
    // the popover variant never produces one, it only nests role="dialog" one
    // level deeper inside Popover.Content (see CustomScenePopover.tsx).
    const dialog = screen.getByRole('dialog', { name: 'Background video' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(screen.getByLabelText('YouTube link')).toBeTruthy()
  })
})
