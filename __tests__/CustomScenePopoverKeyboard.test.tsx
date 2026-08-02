import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import CustomScenePopover from '@/components/timer/CustomScenePopover'
import { DEFAULT_CUSTOM_YOUTUBE_ID } from '@/lib/timer/scenes'

class FakeVisualViewport extends EventTarget {
  height: number
  offsetTop: number

  constructor(height: number, offsetTop = 0) {
    super()
    this.height = height
    this.offsetTop = offsetTop
  }
}

// Reshaped's Modal discards any `attributes.style` passed to it, but never
// touches the physical `bottom` offset itself (only `transform`, for its own
// drag-to-dismiss gesture) — see CustomScenePopover.tsx's modalRootRef effect
// for why that's the property this fix writes imperatively.
describe('CustomScenePopover keyboard-aware positioning', () => {
  let fakeViewport: FakeVisualViewport

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    fakeViewport = new FakeVisualViewport(800)
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: fakeViewport })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function renderPopover() {
    return render(
      <Reshaped>
        <CustomScenePopover
          videoId={DEFAULT_CUSTOM_YOUTUBE_ID}
          isDefault
          variant="dialog"
          hasSoftKeyboard
          isFullscreen={false}
          onSubmit={vi.fn()}
          onResetToDefault={vi.fn()}
          onInvalid={vi.fn()}
          onClose={vi.fn()}
        />
      </Reshaped>
    )
  }

  it('has no bottom offset before the keyboard opens', async () => {
    renderPopover()

    const dialog = screen.getByRole('dialog', { name: 'Background video' })
    // Modal's root node only mounts a commit or two after this component's
    // own effects first run (see CustomScenePopover.tsx's comment), so the
    // offset is applied via a requestAnimationFrame retry — wait for it.
    await waitFor(() => expect(dialog.style.bottom).toBe('0px'))
  })

  it('tracks the keyboard inset as the bottom offset once it opens', async () => {
    renderPopover()
    const dialog = screen.getByRole('dialog', { name: 'Background video' })
    await waitFor(() => expect(dialog.style.bottom).toBe('0px'))

    act(() => {
      fakeViewport.height = 500
      fakeViewport.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => expect(dialog.style.bottom).toBe('300px'))
  })
})
