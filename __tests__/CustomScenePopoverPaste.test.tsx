import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import CustomScenePopover, { INVALID_URL_MESSAGE } from '@/components/timer/CustomScenePopover'
import { DEFAULT_CUSTOM_YOUTUBE_ID } from '@/lib/timer/scenes'

const ALT_ID = 'tMJEp8p9IDM'

// jsdom has no navigator.clipboard at all by default (matching an
// unsupported browser) — each test that needs it installs a fake.
function installClipboard(readText: () => Promise<string>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { readText },
  })
}

function renderPopover(props: Partial<Parameters<typeof CustomScenePopover>[0]> = {}) {
  return render(
    <Reshaped>
      <CustomScenePopover
        videoId={DEFAULT_CUSTOM_YOUTUBE_ID}
        isDefault
        variant="popover"
        onSubmit={vi.fn()}
        onResetToDefault={vi.fn()}
        onInvalid={vi.fn()}
        onClose={vi.fn()}
        {...props}
      />
    </Reshaped>
  )
}

function urlInput() {
  return screen.getByLabelText('YouTube link') as HTMLInputElement
}

describe('CustomScenePopover paste-from-clipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    // @ts-expect-error -- test-only cleanup of a property we defined ourselves
    delete navigator.clipboard
  })

  it('does not render the paste button when clipboard-read is unsupported', () => {
    renderPopover()
    expect(screen.queryByRole('button', { name: 'Paste from clipboard' })).toBeNull()
  })

  it('fills the input with a valid pasted YouTube link', async () => {
    installClipboard(() => Promise.resolve(`https://youtu.be/${ALT_ID}?si=abc`))
    const onInvalid = vi.fn()
    renderPopover({ onInvalid })

    const pasteButton = await screen.findByRole('button', { name: 'Paste from clipboard' })
    await act(async () => {
      pasteButton.click()
    })

    await waitFor(() => expect(urlInput().value).toBe(`https://youtu.be/${ALT_ID}`))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(onInvalid).not.toHaveBeenCalled()
  })

  it('shows the existing invalid-URL error when the clipboard has no YouTube link', async () => {
    installClipboard(() => Promise.resolve('not a link'))
    const onInvalid = vi.fn()
    renderPopover({ onInvalid })

    const pasteButton = await screen.findByRole('button', { name: 'Paste from clipboard' })
    await act(async () => {
      pasteButton.click()
    })

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe(INVALID_URL_MESSAGE))
    expect(onInvalid).toHaveBeenCalledOnce()
  })

  it('does nothing when reading the clipboard is rejected', async () => {
    installClipboard(() => Promise.reject(new Error('denied')))
    renderPopover()

    const pasteButton = await screen.findByRole('button', { name: 'Paste from clipboard' })

    await expect(
      act(async () => {
        pasteButton.click()
      })
    ).resolves.not.toThrow()

    expect(screen.queryByRole('alert')).toBeNull()
  })
})
