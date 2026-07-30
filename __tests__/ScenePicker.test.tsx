import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import ScenePicker from '@/components/timer/ScenePicker'
import {
  CUSTOM_SCENE_ID,
  DEFAULT_CUSTOM_YOUTUBE_ID,
  DEFAULT_SCENE_ID,
  SCENES,
} from '@/lib/timer/scenes'
import { useTimerStore } from '@/lib/timer/store'
import {
  trackCustomSceneEditorOpen,
  trackCustomSceneInvalidUrl,
  trackCustomSceneSet,
  trackSceneChange,
  trackSceneExposure,
} from '@/lib/ga'

vi.mock('@/lib/ga', () => ({
  trackSceneChange: vi.fn(),
  trackSceneExposure: vi.fn(),
  trackCustomSceneEditorOpen: vi.fn(),
  trackCustomSceneSet: vi.fn(),
  trackCustomSceneInvalidUrl: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

const ALT_ID = 'tMJEp8p9IDM'

function urlInput() {
  return screen.getByLabelText('YouTube link') as HTMLInputElement
}

// CustomScenePopover renders Reshaped's Popover/Modal, which need a Theme
// context somewhere above them or they throw on mount.
function renderPicker(element: React.ReactElement = <ScenePicker />) {
  return render(<Reshaped>{element}</Reshaped>)
}

// Reshaped's Popover detects outside clicks via a document-level `mousedown`
// (to mark the click as "inside") followed by `click` — `fireEvent.click`
// alone skips the mousedown a real user gesture would fire first, so every
// click would otherwise register as an outside click and close the popover.
function click(el: Element) {
  fireEvent.mouseDown(el)
  fireEvent.click(el)
}

describe('ScenePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useTimerStore.setState({
      sceneId: DEFAULT_SCENE_ID,
      customYoutubeId: DEFAULT_CUSTOM_YOUTUBE_ID,
    })
  })

  it('renders every built-in scene plus the custom slot', () => {
    renderPicker()

    for (const scene of SCENES) {
      expect(screen.getByRole('button', { name: `Scene: ${scene.name}` })).toBeTruthy()
    }
    expect(screen.getByRole('button', { name: 'Scene: your video' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Change background video' })).toBeTruthy()
  })

  it('logs the outgoing exposure before switching to a built-in scene', () => {
    renderPicker()

    click(screen.getByRole('button', { name: 'Scene: Meadow' }))

    expect(trackSceneExposure).toHaveBeenCalledWith(
      expect.objectContaining({ scene_id: DEFAULT_SCENE_ID, ended_reason: 'switched' })
    )
    expect(trackSceneChange).toHaveBeenCalledWith({ scene_id: 'meadow' })
    expect(useTimerStore.getState().sceneId).toBe('meadow')
  })

  it('selects the custom scene when its tile is clicked while inactive', () => {
    renderPicker()

    click(screen.getByRole('button', { name: 'Scene: your video' }))

    expect(useTimerStore.getState().sceneId).toBe(CUSTOM_SCENE_ID)
    expect(trackSceneChange).toHaveBeenCalledWith({ scene_id: CUSTOM_SCENE_ID })
    expect(screen.queryByLabelText('YouTube link')).toBeNull()
  })

  it('opens the editor when the already-active custom tile is clicked', () => {
    useTimerStore.setState({ sceneId: CUSTOM_SCENE_ID })
    renderPicker()

    click(screen.getByRole('button', { name: 'Edit your video background' }))

    expect(urlInput()).toBeTruthy()
    expect(trackCustomSceneEditorOpen).toHaveBeenCalledOnce()
  })

  it('opens the editor from the badge and reports it to the parent', () => {
    const onEditorOpenChange = vi.fn()
    renderPicker(<ScenePicker onEditorOpenChange={onEditorOpenChange} />)

    click(screen.getByRole('button', { name: 'Change background video' }))

    expect(onEditorOpenChange).toHaveBeenCalledWith(true)
    expect(urlInput().value).toBe(`https://youtu.be/${DEFAULT_CUSTOM_YOUTUBE_ID}`)
    // Selecting isn't a side effect of editing
    expect(useTimerStore.getState().sceneId).toBe(DEFAULT_SCENE_ID)
  })

  it('focuses the URL input as soon as it mounts, however late that is', () => {
    renderPicker()
    click(screen.getByRole('button', { name: 'Change background video' }))

    // Regression: this used to rely on `autoFocus`, which fired before the
    // popover's floating position settled and triggered a page-wide
    // smooth-scroll. The replacement (a ref callback) must still land focus
    // on the input once it exists, just without that side effect.
    expect(document.activeElement).toBe(urlInput())
  })

  it('applies a valid link and switches to the custom scene', () => {
    renderPicker()
    click(screen.getByRole('button', { name: 'Change background video' }))

    fireEvent.change(urlInput(), { target: { value: `https://youtu.be/${ALT_ID}?si=abc` } })
    click(screen.getByRole('button', { name: 'Apply background video' }))

    expect(useTimerStore.getState().customYoutubeId).toBe(ALT_ID)
    expect(useTimerStore.getState().sceneId).toBe(CUSTOM_SCENE_ID)
    expect(trackCustomSceneSet).toHaveBeenCalledWith({ video_id: ALT_ID, is_default: false })
    expect(screen.queryByLabelText('YouTube link')).toBeNull()
  })

  it('rejects a non-YouTube link without touching the scene', () => {
    renderPicker()
    click(screen.getByRole('button', { name: 'Change background video' }))

    fireEvent.change(urlInput(), { target: { value: 'https://vimeo.com/123456789' } })
    click(screen.getByRole('button', { name: 'Apply background video' }))

    expect(screen.getByRole('alert').textContent).toMatch(/doesn't look like a YouTube link/)
    expect(useTimerStore.getState().customYoutubeId).toBe(DEFAULT_CUSTOM_YOUTUBE_ID)
    expect(useTimerStore.getState().sceneId).toBe(DEFAULT_SCENE_ID)
    expect(trackCustomSceneInvalidUrl).toHaveBeenCalledOnce()
    expect(trackCustomSceneSet).not.toHaveBeenCalled()
    // The editor stays open so the link can be fixed in place
    expect(urlInput()).toBeTruthy()
  })

  it('clears the error as soon as the link is edited again', () => {
    renderPicker()
    click(screen.getByRole('button', { name: 'Change background video' }))
    fireEvent.change(urlInput(), { target: { value: 'nope' } })
    click(screen.getByRole('button', { name: 'Apply background video' }))
    expect(screen.getByRole('alert')).toBeTruthy()

    fireEvent.change(urlInput(), { target: { value: `https://youtu.be/${ALT_ID}` } })

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('surfaces a player error passed in from the parent', () => {
    renderPicker(<ScenePicker editorOpen editorError="This video can't be played here." />)

    expect(screen.getByRole('alert').textContent).toMatch(/can't be played here/)
  })

  it('offers a reset back to the shipped video only once it has been changed', () => {
    renderPicker()
    click(screen.getByRole('button', { name: 'Change background video' }))
    expect(screen.queryByRole('button', { name: 'Use default' })).toBeNull()

    fireEvent.change(urlInput(), { target: { value: ALT_ID } })
    click(screen.getByRole('button', { name: 'Apply background video' }))
    click(screen.getByRole('button', { name: 'Change background video' }))

    click(screen.getByRole('button', { name: 'Use default' }))

    expect(useTimerStore.getState().customYoutubeId).toBe(DEFAULT_CUSTOM_YOUTUBE_ID)
    // Distinguishes "reset to shipped default" from a genuinely custom URL
    // in analytics, even though both go through the same applyVideo() call.
    expect(trackCustomSceneSet).toHaveBeenLastCalledWith({
      video_id: DEFAULT_CUSTOM_YOUTUBE_ID,
      is_default: true,
    })
  })

  it('closes on Escape and on the close button', () => {
    const onEditorOpenChange = vi.fn()
    renderPicker(<ScenePicker onEditorOpenChange={onEditorOpenChange} />)

    click(screen.getByRole('button', { name: 'Change background video' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEditorOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.queryByLabelText('YouTube link')).toBeNull()

    click(screen.getByRole('button', { name: 'Change background video' }))
    click(screen.getByRole('button', { name: 'Close background video editor' }))
    expect(screen.queryByLabelText('YouTube link')).toBeNull()
  })
})
