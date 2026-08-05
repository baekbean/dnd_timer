import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import TimerApp from '@/components/timer/TimerApp'
import { useTimerStore } from '@/lib/timer/store'
import { CUSTOM_SCENE_ID, DEFAULT_SCENE_ID } from '@/lib/timer/scenes'
import {
  trackCustomSceneError,
  trackCustomSceneReady,
  trackCustomSceneUnmuteBlocked,
  trackSessionAbandon,
  trackSoundToggle,
} from '@/lib/ga'
import posthog from 'posthog-js'
import { WAVE_ARC_PATH, X_MARK_PATH } from './helpers/speakerIconPaths'

vi.mock('@/lib/ga', () => ({
  trackTimerStart: vi.fn(),
  trackSessionComplete: vi.fn(),
  trackSessionAbandon: vi.fn(),
  trackFullscreenEnter: vi.fn(),
  trackFocusExtend: vi.fn(),
  trackSceneExposure: vi.fn(),
  trackCustomSceneError: vi.fn(),
  trackCustomSceneReady: vi.fn(),
  trackCustomSceneUnmuteBlocked: vi.fn(),
  trackDesktopOnboardingView: vi.fn(),
  // SoundPanel renders live (unmocked) in this file's tests, so its own
  // ga imports need stubs too — otherwise clicking its mute button throws
  // ("No export defined on the mock") instead of updating the store.
  trackSoundToggle: vi.fn(),
  trackCustomSceneSoundSource: vi.fn(),
  trackAmbientPresetChange: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

// Real SceneBackground renders <video>/YoutubeLayer, neither drivable in
// jsdom — replace it with a stand-in that exposes the same callback/ref
// contract via test-only buttons, so TimerApp's own handler logic (not
// YoutubeLayer's, which has its own dedicated test file) is what's exercised.
const mockControls = { retryUnmute: vi.fn(), duck: vi.fn() }
vi.mock('@/components/timer/SceneBackground', () => ({
  default: (props: {
    onYoutubeError?: (code: number) => void
    onYoutubeReady?: () => void
    onYoutubeAudioBlockedChange?: (blocked: boolean) => void
    youtubeControlsRef?: { current: unknown }
  }) => {
    if (props.youtubeControlsRef) props.youtubeControlsRef.current = mockControls
    return (
      <div>
        <button type="button" onClick={() => props.onYoutubeError?.(101)}>
          fire-youtube-error
        </button>
        <button type="button" onClick={() => props.onYoutubeReady?.()}>
          fire-youtube-ready
        </button>
        <button type="button" onClick={() => props.onYoutubeAudioBlockedChange?.(true)}>
          fire-audio-blocked
        </button>
        <button type="button" onClick={() => props.onYoutubeAudioBlockedChange?.(false)}>
          fire-audio-unblocked
        </button>
      </div>
    )
  },
}))

function renderTimerApp() {
  return render(
    <Reshaped>
      <TimerApp />
    </Reshaped>
  )
}

describe('TimerApp — Sound panel + custom-scene handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockControls.retryUnmute.mockClear()
    mockControls.duck.mockClear()
    localStorage.clear()
    act(() => {
      useTimerStore.getState().reset()
    })
  })

  it('swaps the pill icon to the muted glyph when sound is off', () => {
    // reset() (in beforeEach) doesn't touch soundOn — set it explicitly so
    // this test's outcome doesn't depend on execution order relative to
    // other tests in this file that flip it.
    useTimerStore.setState({ soundOn: true })
    renderTimerApp()

    const soundButton = screen.getByRole('button', { name: 'Sound settings' })
    expect(screen.getByText('Sound')).toBeTruthy()
    expect(soundButton.querySelector(`path[d*="${WAVE_ARC_PATH}"]`)).toBeTruthy()
    expect(soundButton.querySelector(`path[d*="${X_MARK_PATH}"]`)).toBeNull()

    act(() => {
      useTimerStore.setState({ soundOn: false })
    })

    expect(screen.getByText('Muted')).toBeTruthy()
    expect(soundButton.querySelector(`path[d*="${X_MARK_PATH}"]`)).toBeTruthy()
    expect(soundButton.querySelector(`path[d*="${WAVE_ARC_PATH}"]`)).toBeNull()
  })

  it('opens the Sound panel from the pill and closes it from the panel itself', () => {
    renderTimerApp()

    const soundButton = screen.getByRole('button', { name: 'Sound settings' })
    expect(soundButton.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(soundButton)
    expect(soundButton.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('dialog', { name: 'Sound' })).toBeTruthy()

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Close sound settings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close sound settings' }))
    expect(soundButton.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('dialog', { name: 'Sound' })).toBeNull()
  })

  it('reflects a mute toggled from inside the popup back onto the pill icon and label', () => {
    // reset() (called in beforeEach) only clears session/timer fields, not
    // soundOn — set it explicitly so this test doesn't depend on ordering
    // relative to other tests that flip it (see the pill-icon-swap test above).
    useTimerStore.setState({ soundOn: true })
    renderTimerApp()

    const soundButton = screen.getByRole('button', { name: 'Sound settings' })
    fireEvent.click(soundButton)
    expect(screen.getByRole('dialog', { name: 'Sound' })).toBeTruthy()

    const muteButton = screen.getByRole('button', { name: 'Mute' })
    // Reshaped's Popover only registers a click as "inside" after a preceding
    // mousedown on the same element (see SoundPanel.test.tsx's `click` helper).
    fireEvent.mouseDown(muteButton)
    fireEvent.click(muteButton)

    expect(useTimerStore.getState().soundOn).toBe(false)
    expect(screen.getByText('Muted')).toBeTruthy()
    expect(soundButton.querySelector(`path[d*="${X_MARK_PATH}"]`)).toBeTruthy()
    expect(soundButton.querySelector(`path[d*="${WAVE_ARC_PATH}"]`)).toBeNull()
  })

  it('toggles mute with the "m" key, matching the YouTube shortcut', () => {
    useTimerStore.setState({ soundOn: true })
    renderTimerApp()

    fireEvent.keyDown(document, { key: 'm' })

    expect(useTimerStore.getState().soundOn).toBe(false)
    expect(trackSoundToggle).toHaveBeenCalledWith({ sound_on: false, source: 'keyboard' })

    fireEvent.keyDown(document, { key: 'M' })

    expect(useTimerStore.getState().soundOn).toBe(true)
  })

  it('ignores the "m" shortcut while typing in a text field', () => {
    useTimerStore.setState({ soundOn: true })
    renderTimerApp()

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    fireEvent.keyDown(input, { key: 'm' })

    expect(useTimerStore.getState().soundOn).toBe(true)
    expect(trackSoundToggle).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('ignores the "m" shortcut when a modifier key is held, so it does not hijack Cmd+M/Ctrl+M', () => {
    useTimerStore.setState({ soundOn: true })
    renderTimerApp()

    fireEvent.keyDown(document, { key: 'm', metaKey: true })
    fireEvent.keyDown(document, { key: 'm', ctrlKey: true })
    fireEvent.keyDown(document, { key: 'm', altKey: true })

    expect(useTimerStore.getState().soundOn).toBe(true)
    expect(trackSoundToggle).not.toHaveBeenCalled()
  })

  it('still toggles with "m" while the volume slider has focus, since it is an <input> but not a text field', () => {
    useTimerStore.setState({ soundOn: true })
    renderTimerApp()

    const rangeInput = document.createElement('input')
    rangeInput.type = 'range'
    document.body.appendChild(rangeInput)
    rangeInput.focus()

    fireEvent.keyDown(rangeInput, { key: 'm' })

    expect(useTimerStore.getState().soundOn).toBe(false)
    expect(trackSoundToggle).toHaveBeenCalledWith({ sound_on: false, source: 'keyboard' })

    document.body.removeChild(rangeInput)
  })

  it('ignores a held-down "m" (key repeat), so it does not spam toggles or thrash ambient audio', () => {
    useTimerStore.setState({ soundOn: true })
    renderTimerApp()

    fireEvent.keyDown(document, { key: 'm', repeat: true })
    fireEvent.keyDown(document, { key: 'm', repeat: true })
    fireEvent.keyDown(document, { key: 'm', repeat: true })

    expect(useTimerStore.getState().soundOn).toBe(true)
    expect(trackSoundToggle).not.toHaveBeenCalled()

    // A genuine (non-repeat) press still works afterward.
    fireEvent.keyDown(document, { key: 'm' })
    expect(useTimerStore.getState().soundOn).toBe(false)
    expect(trackSoundToggle).toHaveBeenCalledTimes(1)
  })

  it('falls back to the default scene and reopens the editor with an error when the embed errors', () => {
    useTimerStore.setState({ sceneId: CUSTOM_SCENE_ID, customYoutubeId: 'abcdefghijk' })
    renderTimerApp()

    fireEvent.click(screen.getByText('fire-youtube-error'))

    expect(trackCustomSceneError).toHaveBeenCalledWith({ code: 101 })
    expect(useTimerStore.getState().sceneId).toBe(DEFAULT_SCENE_ID)
    expect(screen.getByRole('alert').textContent).toMatch(/can't be played here/)
  })

  it('tracks custom_scene_ready with the active video_id when the embed loads', () => {
    useTimerStore.setState({ sceneId: CUSTOM_SCENE_ID, customYoutubeId: 'abcdefghijk' })
    renderTimerApp()

    fireEvent.click(screen.getByText('fire-youtube-ready'))

    expect(trackCustomSceneReady).toHaveBeenCalledWith({ video_id: 'abcdefghijk' })
    expect(posthog.capture).toHaveBeenCalledWith('custom_scene_ready', { video_id: 'abcdefghijk' })
  })

  it('includes scene_id when a mid-focus reset fires session_abandon', () => {
    useTimerStore.setState({ sceneId: DEFAULT_SCENE_ID })
    renderTimerApp()

    act(() => {
      useTimerStore.getState().start()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(trackSessionAbandon).toHaveBeenCalledWith(
      expect.objectContaining({ via: 'reset', scene_id: DEFAULT_SCENE_ID })
    )
    expect(posthog.capture).toHaveBeenCalledWith(
      'session_abandon',
      expect.objectContaining({ via: 'reset', scene_id: DEFAULT_SCENE_ID })
    )
  })

  it('tracks the unmute-blocked event once and shows a retry button that calls back into the player', () => {
    useTimerStore.setState({
      sceneId: CUSTOM_SCENE_ID,
      customYoutubeId: 'abcdefghijk',
      customSoundSource: 'video',
      soundOn: true,
    })
    renderTimerApp()

    expect(screen.queryByRole('button', { name: 'Tap to enable sound' })).toBeNull()

    fireEvent.click(screen.getByText('fire-audio-blocked'))

    expect(trackCustomSceneUnmuteBlocked).toHaveBeenCalledOnce()
    const retryButton = screen.getByRole('button', { name: 'Tap to enable sound' })

    fireEvent.click(retryButton)
    expect(mockControls.retryUnmute).toHaveBeenCalledOnce()
  })

  it('does not re-track unmute-blocked on a later block after an intervening unblock', () => {
    useTimerStore.setState({
      sceneId: CUSTOM_SCENE_ID,
      customYoutubeId: 'abcdefghijk',
      customSoundSource: 'video',
      soundOn: true,
    })
    renderTimerApp()

    fireEvent.click(screen.getByText('fire-audio-blocked'))
    expect(trackCustomSceneUnmuteBlocked).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Tap to enable sound' })).toBeTruthy()

    fireEvent.click(screen.getByText('fire-audio-unblocked'))
    expect(screen.queryByRole('button', { name: 'Tap to enable sound' })).toBeNull()

    fireEvent.click(screen.getByText('fire-audio-blocked'))
    // The tracking ref is set for the component's lifetime — a later block
    // doesn't fire the "funnel" event a second time.
    expect(trackCustomSceneUnmuteBlocked).toHaveBeenCalledOnce()
  })

  it('ducks the video under the chime on a natural completion for the custom video scene', () => {
    useTimerStore.setState({
      sceneId: CUSTOM_SCENE_ID,
      customYoutubeId: 'abcdefghijk',
      customSoundSource: 'video',
      soundOn: true,
    })
    renderTimerApp()

    act(() => {
      useTimerStore.setState({ completions: 1, lastCompletedPhase: 'focus' })
    })

    expect(mockControls.duck).toHaveBeenCalledWith(2000)
  })

  it('does not duck the video when the ambient (not video) source is active', () => {
    useTimerStore.setState({
      sceneId: CUSTOM_SCENE_ID,
      customYoutubeId: 'abcdefghijk',
      customSoundSource: 'app',
      soundOn: true,
    })
    renderTimerApp()

    act(() => {
      useTimerStore.setState({ completions: 1, lastCompletedPhase: 'focus' })
    })

    expect(mockControls.duck).not.toHaveBeenCalled()
  })
})
