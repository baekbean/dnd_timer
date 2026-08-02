'use client'

import { useRef, useState } from 'react'
import CustomScenePopover from '@/components/timer/CustomScenePopover'
import {
  CUSTOM_SCENE_ID,
  DEFAULT_CUSTOM_YOUTUBE_ID,
  SCENES,
  type Scene,
} from '@/lib/timer/scenes'
import { useTimerStore } from '@/lib/timer/store'
import { youtubeThumbnailUrl } from '@/lib/timer/youtube'
import {
  trackCustomSceneEditorOpen,
  trackCustomSceneInvalidUrl,
  trackCustomSceneSet,
  trackSceneChange,
  trackSceneExposure,
} from '@/lib/ga'
import { markSceneEntered, msSinceSceneEntered } from '@/lib/timer/exposureTracking'
import { useDeviceType } from '@/lib/timer/useDeviceType'
import { useLandscape } from '@/lib/timer/useLandscape'
import posthog from 'posthog-js'

const TILE_CLASS = 'h-10 w-[60px] rounded-xl bg-cover bg-center transition-all'

function tileShadow(active: boolean) {
  return active
    ? '0 0 0 2px rgba(246,246,243,0.9), 0 2px 8px rgba(0,0,0,0.25)'
    : '0 0 0 1px rgba(246,246,243,0.25), 0 2px 8px rgba(0,0,0,0.15)'
}

interface Props {
  /** Controlled by TimerApp so the idle chrome fade can be suspended while open. */
  editorOpen?: boolean
  /** Surfaced when the player rejected the video, so the person can fix it here. */
  editorError?: string | null
  onEditorOpenChange?: (open: boolean) => void
  /** Timer's fullscreen container — passed through to CustomScenePopover so it
   * stays reachable while the timer is fullscreen. */
  containerRef?: React.RefObject<HTMLElement | null>
  /** Reshaped's Popover doesn't re-parent into containerRef (only Modal/Overlay
   * does), so a Popover portaled to document.body falls outside the fullscreen
   * top layer and becomes invisible. Force the dialog variant instead while
   * fullscreen, same as the mobile/landscape case below. */
  isFullscreen?: boolean
}

export default function ScenePicker({
  editorOpen,
  editorError = null,
  onEditorOpenChange,
  containerRef,
  isFullscreen = false,
}: Props = {}) {
  const sceneId = useTimerStore((s) => s.sceneId)
  const setScene = useTimerStore((s) => s.setScene)
  const customYoutubeId = useTimerStore((s) => s.customYoutubeId)
  const setCustomYoutubeId = useTimerStore((s) => s.setCustomYoutubeId)

  // Uncontrolled fallback keeps the picker usable where TimerApp doesn't
  // manage the editor (the /timer-test2 route renders this component bare).
  const [localOpen, setLocalOpen] = useState(false)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const open = editorOpen ?? localOpen
  const setOpen = (next: boolean) => {
    setLocalOpen(next)
    onEditorOpenChange?.(next)
  }

  const deviceType = useDeviceType()
  const isLandscape = useLandscape()
  // A bottom-anchored popover lands right under the on-screen keyboard on
  // phones, and there's no vertical room for it in landscape either. Fullscreen
  // forces it too, since only the dialog variant stays visible there (see the
  // isFullscreen prop doc above).
  const variant = deviceType === 'mobile' || isLandscape || isFullscreen ? 'dialog' : 'popover'

  const customActive = sceneId === CUSTOM_SCENE_ID

  /** Fires the same exposure → change → re-arm sequence for every tile. */
  const selectScene = (nextId: string) => {
    if (nextId !== sceneId) {
      // Log the OUTGOING scene's exposure before switching — this is
      // what lets the default scene's usage be measured too, since it
      // never gets a "switch to" event of its own.
      const duration_ms = msSinceSceneEntered()
      trackSceneExposure({ scene_id: sceneId, duration_ms, ended_reason: 'switched' })
      posthog.capture('scene_exposure', { scene_id: sceneId, duration_ms, ended_reason: 'switched' })

      trackSceneChange({ scene_id: nextId })
      posthog.capture('scene_change', { scene_id: nextId })
      markSceneEntered()
    }
    setScene(nextId)
  }

  const openEditor = () => {
    trackCustomSceneEditorOpen()
    posthog.capture('custom_scene_editor_open', {})
    setOpen(true)
  }

  const applyVideo = (videoId: string) => {
    setCustomYoutubeId(videoId)
    const is_default = videoId === DEFAULT_CUSTOM_YOUTUBE_ID
    trackCustomSceneSet({ video_id: videoId, is_default })
    posthog.capture('custom_scene_set', { video_id: videoId, is_default })
    selectScene(CUSTOM_SCENE_ID)
    setOpen(false)
  }

  return (
    <div className="relative flex items-center gap-3">
      {SCENES.map((scene: Scene) => {
        const active = scene.id === sceneId
        return (
          <button
            key={scene.id}
            type="button"
            aria-label={`Scene: ${scene.name}`}
            aria-pressed={active}
            title={scene.name}
            onClick={() => selectScene(scene.id)}
            className={TILE_CLASS}
            style={{
              background: scene.backgroundImage
                ? `url(${scene.backgroundImage})`
                : scene.fallbackGradient,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: tileShadow(active),
              opacity: active ? 1 : 0.75,
            }}
          />
        )
      })}

      {/* Custom slot — ships with a video already in it, so it's never an
          empty state. The tile selects; the badge edits. */}
      <div className="relative">
        <button
          type="button"
          aria-label={customActive ? 'Edit your video background' : 'Scene: your video'}
          aria-pressed={customActive}
          title="Your video"
          onClick={() => (customActive ? openEditor() : selectScene(CUSTOM_SCENE_ID))}
          className={TILE_CLASS}
          style={{
            backgroundImage: `url(${youtubeThumbnailUrl(customYoutubeId)}), linear-gradient(160deg, #2b2b30 0%, #1a1a1f 55%, #0c0c10 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: tileShadow(customActive),
            opacity: customActive ? 1 : 0.75,
          }}
        />
        <button
          ref={editButtonRef}
          type="button"
          aria-label="Change background video"
          onClick={(e) => {
            e.stopPropagation()
            openEditor()
          }}
          // The dot stays 20px; an invisible ::before stretches the touch
          // target to ~34px so it's tappable on a phone.
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F6F6F3] text-[#343434] shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-transform hover:scale-110 before:absolute before:-inset-[7px] before:rounded-full before:content-['']"
        >
          {customActive ? (
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M8.4 1.6a1.4 1.4 0 0 1 2 2L4 10 1.2 10.8 2 8l6.4-6.4Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <CustomScenePopover
          videoId={customYoutubeId}
          isDefault={customYoutubeId === DEFAULT_CUSTOM_YOUTUBE_ID}
          initialError={editorError}
          variant={variant}
          triggerRef={editButtonRef}
          containerRef={containerRef}
          onSubmit={applyVideo}
          onResetToDefault={() => applyVideo(DEFAULT_CUSTOM_YOUTUBE_ID)}
          onInvalid={() => {
            trackCustomSceneInvalidUrl()
            posthog.capture('custom_scene_invalid_url', {})
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
