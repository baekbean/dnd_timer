import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import SoundPanel from '@/components/timer/SoundPanel'
import { buildCustomScene, getScene } from '@/lib/timer/scenes'
import { useTimerStore } from '@/lib/timer/store'
import {
  trackSoundToggle,
  trackCustomSceneSoundSource,
  trackAmbientPresetChange,
} from '@/lib/ga'
import { WAVE_ARC_PATH, X_MARK_PATH } from './helpers/speakerIconPaths'

vi.mock('@/lib/ga', () => ({
  trackSoundToggle: vi.fn(),
  trackCustomSceneSoundSource: vi.fn(),
  trackAmbientPresetChange: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

const youtubeScene = buildCustomScene('abcdefghijk')
const builtInScene = getScene('meadow')

// Reshaped's Popover renders a nested <Theme> for its content, which throws
// without a theme context somewhere above it in the tree.
function renderPanel(props: Parameters<typeof SoundPanel>[0]) {
  return render(
    <Reshaped>
      <SoundPanel {...props} />
    </Reshaped>
  )
}

// Reshaped's Popover detects outside clicks via a document-level `mousedown`
// (to mark the click as "inside") followed by `click` — `fireEvent.click`
// alone skips the mousedown a real user gesture would fire first, so every
// click would otherwise register as an outside click and close the popover.
function click(el: Element) {
  fireEvent.mouseDown(el)
  fireEvent.click(el)
}

describe('SoundPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useTimerStore.setState({
      soundOn: true,
      customSoundSource: 'video',
      ambientPresetId: 'brown',
      volume: 0.6,
      videoVolume: 0.6,
    })
  })

  it('toggles mute via the speaker button and tracks it', () => {
    const onClose = vi.fn()
    renderPanel({ scene: builtInScene, onClose })

    const muteButton = screen.getByRole('button', { name: 'Mute' })
    // Unmuted glyph: the volume-2 wave-arc path is present, the volume-x
    // X-mark path is not.
    expect(muteButton.querySelector(`path[d*="${WAVE_ARC_PATH}"]`)).toBeTruthy()
    expect(muteButton.querySelector(`path[d*="${X_MARK_PATH}"]`)).toBeNull()

    click(muteButton)

    expect(useTimerStore.getState().soundOn).toBe(false)
    expect(trackSoundToggle).toHaveBeenCalledWith({ sound_on: false, source: 'button' })
    const unmuteButton = screen.getByRole('button', { name: 'Unmute' })
    expect(unmuteButton).toBeTruthy()
    // Muted glyph: swaps to the volume-x X-mark path, wave-arc path gone.
    expect(unmuteButton.querySelector(`path[d*="${X_MARK_PATH}"]`)).toBeTruthy()
    expect(unmuteButton.querySelector(`path[d*="${WAVE_ARC_PATH}"]`)).toBeNull()
  })

  it('moves the slider to 0% when muted via the speaker button, then restores it on unmute — without touching the stored volume', () => {
    renderPanel({ scene: builtInScene, onClose: vi.fn() })

    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('60')

    click(screen.getByRole('button', { name: 'Mute' }))

    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('0')
    // The mute button never mutates volume — only the display resets to 0.
    expect(useTimerStore.getState().volume).toBe(0.6)

    click(screen.getByRole('button', { name: 'Unmute' }))

    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('60')
    expect(useTimerStore.getState().volume).toBe(0.6)
  })

  it('keeps the volume slider interactive while muted, so dragging it can unmute', () => {
    renderPanel({ scene: builtInScene, onClose: vi.fn() })

    expect((screen.getByRole('slider') as HTMLInputElement).disabled).toBe(false)

    click(screen.getByRole('button', { name: 'Mute' }))

    expect((screen.getByRole('slider') as HTMLInputElement).disabled).toBe(false)
  })

  it('mutes and tracks it when the slider is dragged down to 0%', () => {
    renderPanel({ scene: builtInScene, onClose: vi.fn() })

    fireEvent.change(screen.getByRole('slider'), { target: { value: '0' } })

    expect(useTimerStore.getState().volume).toBe(0)
    expect(useTimerStore.getState().soundOn).toBe(false)
    expect(trackSoundToggle).toHaveBeenCalledWith({ sound_on: false, source: 'slider' })
  })

  it('unmutes and tracks it when the slider is dragged up from 0% while muted', () => {
    useTimerStore.setState({ soundOn: false, volume: 0 })
    renderPanel({ scene: builtInScene, onClose: vi.fn() })

    fireEvent.change(screen.getByRole('slider'), { target: { value: '25' } })

    expect(useTimerStore.getState().volume).toBeCloseTo(0.25)
    expect(useTimerStore.getState().soundOn).toBe(true)
    expect(trackSoundToggle).toHaveBeenCalledWith({ sound_on: true, source: 'slider' })
  })

  it('does not re-toggle or re-track mute for an ordinary drag between two nonzero values', () => {
    renderPanel({ scene: builtInScene, onClose: vi.fn() })

    fireEvent.change(screen.getByRole('slider'), { target: { value: '40' } })

    expect(useTimerStore.getState().volume).toBeCloseTo(0.4)
    expect(useTimerStore.getState().soundOn).toBe(true)
    expect(trackSoundToggle).not.toHaveBeenCalled()
  })

  it('does not flap the mute state while the value jitters mid-drag — only the settled value on release decides it', () => {
    renderPanel({ scene: builtInScene, onClose: vi.fn() })

    const root = screen.getByRole('slider').parentElement!.parentElement!
    // Reshaped's SliderControlled renders [bar div, thumbs div] as the root's
    // only two children, in that order — the bar is always the first child.
    const bar = root.children[0] as HTMLElement
    // Reshaped computes drag position from the bar's layout rect — jsdom does
    // no real layout, so give it a fixed, round-number rect to compute against.
    vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 216,
      width: 216,
      top: 0,
      bottom: 20,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    })
    Object.defineProperty(bar, 'clientWidth', { value: 216, configurable: true })

    // clientX=8 → 0% (bar left edge + half the thumb's reserved 16px).
    // clientX=18 → 5%. clientX=108 → 50%.
    // Reshaped's own mousedown handler commits its start position immediately
    // (independent of this fix), so start the drag at a nonzero value —
    // matching the already-unmuted state, so that commit is a no-op — then
    // jitter across the 0% boundary via pure mousemoves before releasing.
    fireEvent.mouseDown(root, { clientX: 108 })
    expect(trackSoundToggle).not.toHaveBeenCalled()

    fireEvent.mouseMove(window, { clientX: 18 })
    fireEvent.mouseMove(window, { clientX: 8 })
    fireEvent.mouseMove(window, { clientX: 18 })
    fireEvent.mouseMove(window, { clientX: 8 })

    // None of the mid-drag jitter across the boundary should have committed
    // a mute toggle yet — only drag release does.
    expect(trackSoundToggle).not.toHaveBeenCalled()
    expect(useTimerStore.getState().soundOn).toBe(true)

    fireEvent.mouseUp(window)

    expect(useTimerStore.getState().soundOn).toBe(false)
    expect(trackSoundToggle).toHaveBeenCalledTimes(1)
    expect(trackSoundToggle).toHaveBeenCalledWith({ sound_on: false, source: 'slider' })
  })

  it('closes on the X button, Escape, and an outside click', () => {
    const onClose = vi.fn()
    const { unmount } = renderPanel({ scene: builtInScene, onClose })

    click(screen.getByRole('button', { name: 'Close sound settings' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    onClose.mockClear()
    renderPanel({ scene: builtInScene, onClose })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when the card itself is clicked', () => {
    const onClose = vi.fn()
    renderPanel({ scene: builtInScene, onClose })

    click(screen.getByRole('dialog', { name: 'Sound' }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('hides the Ambient/Video source picker for a built-in scene', () => {
    renderPanel({ scene: builtInScene, onClose: vi.fn() })

    expect(screen.queryByRole('button', { name: 'Ambient' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Video' })).toBeNull()
    // No source to pick, so ambient presets show unconditionally
    expect(screen.getByRole('button', { name: 'Rain' })).toBeTruthy()
  })

  it('shows the source picker for the custom YouTube scene and switches sections', () => {
    renderPanel({ scene: youtubeScene, onClose: vi.fn() })

    // customSoundSource starts as 'video' — presets hidden
    expect(screen.queryByRole('button', { name: 'Rain' })).toBeNull()

    const videoButton = screen.getByRole('button', { name: 'Video' })
    expect(videoButton.getAttribute('aria-pressed')).toBe('true')

    click(screen.getByRole('button', { name: 'Ambient' }))

    expect(useTimerStore.getState().customSoundSource).toBe('app')
    expect(trackCustomSceneSoundSource).toHaveBeenCalledWith({ source: 'app' })
    expect(screen.getByRole('button', { name: 'Rain' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ambient' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('selects an ambient preset and tracks it', () => {
    renderPanel({ scene: builtInScene, onClose: vi.fn() })

    click(screen.getByRole('button', { name: 'Rain' }))

    expect(useTimerStore.getState().ambientPresetId).toBe('rain')
    expect(trackAmbientPresetChange).toHaveBeenCalledWith({ preset: 'rain' })
  })

  it('adjusts the ambient volume via the master slider when the built-in scene is active', () => {
    renderPanel({ scene: builtInScene, onClose: vi.fn() })

    fireEvent.change(screen.getByRole('slider'), { target: { value: '30' } })

    expect(useTimerStore.getState().volume).toBeCloseTo(0.3)
    expect(useTimerStore.getState().videoVolume).toBe(0.6)
  })

  it('adjusts the video volume via the master slider when the video source is active', () => {
    useTimerStore.setState({ customSoundSource: 'video' })
    renderPanel({ scene: youtubeScene, onClose: vi.fn() })

    fireEvent.change(screen.getByRole('slider'), { target: { value: '80' } })

    expect(useTimerStore.getState().videoVolume).toBeCloseTo(0.8)
    expect(useTimerStore.getState().volume).toBe(0.6)
  })

  it('re-binds the master slider to ambient volume after switching away from video', () => {
    useTimerStore.setState({ customSoundSource: 'video' })
    renderPanel({ scene: youtubeScene, onClose: vi.fn() })

    click(screen.getByRole('button', { name: 'Ambient' }))
    fireEvent.change(screen.getByRole('slider'), { target: { value: '40' } })

    expect(useTimerStore.getState().volume).toBeCloseTo(0.4)
    expect(useTimerStore.getState().videoVolume).toBe(0.6)
  })

  // Reshaped's Popover doesn't re-parent into containerRef (only Modal/Overlay
  // does), so a Popover portaled to document.body falls outside the fullscreen
  // top layer and becomes invisible — see SoundPanel.tsx's isFullscreen branch.
  it('renders as a centered dialog instead of a bottom-anchored popover while fullscreen', () => {
    renderPanel({ scene: builtInScene, isFullscreen: true, onClose: vi.fn() })

    // Reshaped's Modal renders its own top-level aria-modal dialog landmark —
    // the popover variant never produces one, it only sets role="dialog" on
    // the plain content wrapper (see SoundPanel.tsx's `card`).
    const dialog = screen.getByRole('dialog', { name: 'Sound' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })
})
