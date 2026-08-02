import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import ScenePicker from '@/components/timer/ScenePicker'
import { DEFAULT_CUSTOM_YOUTUBE_ID, DEFAULT_SCENE_ID } from '@/lib/timer/scenes'
import { useTimerStore } from '@/lib/timer/store'

// Reshaped's Popover doesn't re-parent into containerRef (only Modal/Overlay
// does), so a Popover portaled to document.body falls outside the fullscreen
// top layer and becomes invisible — see ScenePicker.tsx's `variant`
// calculation. isFullscreen forces the dialog variant for the same reason
// mobile/landscape already does.
vi.mock('@/lib/ga', () => ({
  trackSceneChange: vi.fn(),
  trackSceneExposure: vi.fn(),
  trackCustomSceneEditorOpen: vi.fn(),
  trackCustomSceneSet: vi.fn(),
  trackCustomSceneInvalidUrl: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

function renderPicker(isFullscreen: boolean) {
  return render(
    <Reshaped>
      <ScenePicker isFullscreen={isFullscreen} />
    </Reshaped>
  )
}

// Same outside-click quirk as ScenePicker.test.tsx's `click()` helper.
function click(el: Element) {
  fireEvent.mouseDown(el)
  fireEvent.click(el)
}

describe('ScenePicker while the timer is fullscreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useTimerStore.setState({
      sceneId: DEFAULT_SCENE_ID,
      customYoutubeId: DEFAULT_CUSTOM_YOUTUBE_ID,
    })
  })

  it('opens the background-video editor as a centered dialog instead of a bottom-anchored popover', () => {
    renderPicker(true)

    click(screen.getByRole('button', { name: 'Change background video' }))

    // Reshaped's Modal renders its own top-level aria-modal dialog landmark —
    // the popover variant never produces one, it only nests role="dialog" one
    // level deeper inside Popover.Content (see CustomScenePopover.tsx).
    const dialog = screen.getByRole('dialog', { name: 'Background video' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(screen.getByLabelText('YouTube link')).toBeTruthy()
  })

  it('still uses the bottom-anchored popover when not fullscreen', () => {
    renderPicker(false)

    click(screen.getByRole('button', { name: 'Change background video' }))

    const dialog = screen.getByRole('dialog', { name: 'Background video' })
    expect(dialog.getAttribute('aria-modal')).not.toBe('true')
  })
})
