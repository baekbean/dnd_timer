import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import ScenePicker from '@/components/timer/ScenePicker'
import { DEFAULT_CUSTOM_YOUTUBE_ID, DEFAULT_SCENE_ID } from '@/lib/timer/scenes'
import { useTimerStore } from '@/lib/timer/store'

// A phone (or a phone-width landscape view) picks the dialog variant instead
// of the bottom-anchored popover, since a popover would land right under the
// on-screen keyboard — see ScenePicker.tsx's `variant` calculation. That
// branch is untouched by ScenePicker.test.tsx, which always renders on the
// (mocked) desktop default.
vi.mock('@/lib/timer/useDeviceType', () => ({ useDeviceType: () => 'mobile' }))

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

describe('ScenePicker on a phone-classified device', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useTimerStore.setState({
      sceneId: DEFAULT_SCENE_ID,
      customYoutubeId: DEFAULT_CUSTOM_YOUTUBE_ID,
    })
  })

  it('opens the background-video editor as a centered dialog instead of a bottom-anchored popover', () => {
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
