'use client'

import { Modal, Popover, Slider, ToggleButton, ToggleButtonGroup } from 'reshaped'
import type { Scene } from '@/lib/timer/scenes'
import { useTimerStore, type SoundSource } from '@/lib/timer/store'
import SpeakerIcon from '@/components/timer/SpeakerIcon'
import { AMBIENT_PRESET_IDS, type AmbientPresetId } from '@/lib/timer/sound'
import {
  trackSoundToggle,
  trackCustomSceneSoundSource,
  trackAmbientPresetChange,
} from '@/lib/ga'
import posthog from 'posthog-js'

const PRESET_LABELS: Record<AmbientPresetId, string> = {
  white: 'White',
  brown: 'Brown',
  rain: 'Rain',
  birds: 'Birds',
  gardenCrickets: 'Garden crickets',
  nightBugs: 'Night bugs',
}

const SOURCE_LABELS: Record<SoundSource, string> = {
  app: 'Ambient',
  video: 'Video',
}

// Video-player-style master control: click the speaker to mute/unmute,
// drag the slider for volume. Which volume it drives (ambient vs. video)
// is decided by the caller — there's only ever one audible source at a time.
function MasterVolumeControl({
  soundOn,
  onToggleSoundOn,
  name,
  value,
  onChangeValue,
  onCommitValue,
}: {
  soundOn: boolean
  onToggleSoundOn: (next: boolean) => void
  name: string
  value: number
  onChangeValue: (v: number) => void
  onCommitValue: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-[rgba(52,52,52,0.06)] py-2 pl-3 pr-4">
      <button
        type="button"
        aria-pressed={!soundOn}
        aria-label={soundOn ? 'Mute' : 'Unmute'}
        onClick={() => onToggleSoundOn(!soundOn)}
        className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#343434]/5 focus-visible:bg-[#343434]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#343434]/30"
      >
        <SpeakerIcon
          muted={!soundOn}
          color="#343434"
          className="scale-[1.2] transition-transform duration-150 group-hover:scale-[1.32] group-focus-visible:scale-[1.32]"
        />
      </button>
      <div className="min-w-0 flex-1">
        {/* Stays interactive while muted — dragging it is itself an unmute
         * gesture (see onCommitValue in the caller), matching how video
         * players usually treat "grab the volume slider" as "I want sound."
         * Display-only 0 while muted: the real `value` is untouched, so
         * unmuting via the speaker button (or the 'm' shortcut) snaps the
         * thumb straight back to where you left it, audio included.
         * The mute-toggle decision lives in onChangeCommit (fires once, on
         * release/click/keyboard-nudge) rather than onChange (fires on every
         * step of a drag) — deciding it live would flap the mute state any
         * time an in-progress drag jitters across the 0% boundary. */}
        <Slider
          name={name}
          value={soundOn ? Math.round(value * 100) : 0}
          onChange={({ value }) => onChangeValue(value / 100)}
          onChangeCommit={({ value }) => onCommitValue(value / 100)}
        />
      </div>
    </div>
  )
}

interface Props {
  scene: Scene
  /** Element the popover is anchored to — the "Sound" pill in TimerApp. */
  triggerRef?: React.RefObject<HTMLElement | null>
  /** Timer's fullscreen container — keeps the popover/modal inside it instead
   * of portaling to document.body, which would render outside (and so be
   * invisible/unreachable) while the timer is fullscreen. */
  containerRef?: React.RefObject<HTMLElement | null>
  /** Reshaped's Popover doesn't re-parent into containerRef (only Modal/Overlay
   * does), so a Popover portaled to document.body falls outside the fullscreen
   * top layer and becomes invisible. Render as a centered Modal instead while
   * fullscreen, same fix as ScenePicker's background-video editor. */
  isFullscreen?: boolean
  onClose: () => void
}

export default function SoundPanel({
  scene,
  triggerRef,
  containerRef,
  isFullscreen = false,
  onClose,
}: Props) {
  const soundOn = useTimerStore((s) => s.soundOn)
  const setSoundOn = useTimerStore((s) => s.setSoundOn)
  const customSoundSource = useTimerStore((s) => s.customSoundSource)
  const setCustomSoundSource = useTimerStore((s) => s.setCustomSoundSource)
  const ambientPresetId = useTimerStore((s) => s.ambientPresetId)
  const setAmbientPresetId = useTimerStore((s) => s.setAmbientPresetId)
  const volume = useTimerStore((s) => s.volume)
  const setVolume = useTimerStore((s) => s.setVolume)
  const videoVolume = useTimerStore((s) => s.videoVolume)
  const setVideoVolume = useTimerStore((s) => s.setVideoVolume)

  // The Ambient/Video choice only exists for the custom scene — the 4
  // built-in scenes have no alternate audio source to pick between.
  const showSourcePicker = Boolean(scene.youtube)
  const showAmbientControls = !scene.youtube || customSoundSource === 'app'
  const showVideoControls = Boolean(scene.youtube) && customSoundSource === 'video'

  // Only one source is ever audible at a time, so the master control always
  // drives whichever one is active.
  const activeVolume = showVideoControls ? videoVolume : volume
  const setActiveVolume = showVideoControls ? setVideoVolume : setVolume
  const activeVolumeName = showVideoControls ? 'video-volume' : 'ambient-volume'

  const handleToggleSoundOn = (checked: boolean, source: 'button' | 'slider') => {
    trackSoundToggle({ sound_on: checked, source })
    posthog.capture('sound_change', { sound_on: checked, source })
    setSoundOn(checked)
  }

  // Box styling (background/radius/shadow/padding) comes from the Popover or
  // Modal wrapper below — this is just the content. The Modal variant is
  // already its own labeled dialog — a nested role="dialog" here would be a
  // redundant/confusing landmark for AT.
  const card = (
    <div role={isFullscreen ? undefined : 'dialog'} aria-label={isFullscreen ? undefined : 'Sound'}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-aspekta text-[18px] uppercase text-[#343434]">Sound</h2>
        <button
          type="button"
          aria-label="Close sound settings"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#343434]/5"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="#343434" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <span className="font-pretendard text-[15px] text-[#343434]">Volume</span>
        <MasterVolumeControl
          soundOn={soundOn}
          onToggleSoundOn={(checked) => handleToggleSoundOn(checked, 'button')}
          name={activeVolumeName}
          value={activeVolume}
          onChangeValue={setActiveVolume}
          onCommitValue={(v) => {
            // Dragging to exactly 0% mutes; dragging off of 0% while muted
            // unmutes — the slider drives soundOn directly at that boundary,
            // same as most video players. Decided on commit (drag release/
            // click/keyboard nudge), not on every onChange step, so jitter
            // mid-drag across the 0% line can't flap the mute state.
            const shouldBeOn = v > 0
            if (shouldBeOn !== soundOn) handleToggleSoundOn(shouldBeOn, 'slider')
          }}
        />

        <div className="flex flex-col gap-4">
          <span className="font-pretendard text-[15px] text-[#343434]">Sound type</span>

          {showSourcePicker && (
            <ToggleButtonGroup
              value={[customSoundSource]}
              onChange={({ value }) => {
                const source = value[0] as SoundSource | undefined
                if (!source) return
                setCustomSoundSource(source)
                trackCustomSceneSoundSource({ source })
                posthog.capture('custom_scene_sound_source', { source })
              }}
              color="neutral"
              selectedColor="primary"
              className="w-full"
            >
              <ToggleButton value="app" variant="solid" fullWidth>
                {SOURCE_LABELS.app}
              </ToggleButton>
              <ToggleButton value="video" variant="solid" fullWidth>
                {SOURCE_LABELS.video}
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          {showAmbientControls && (
            <div className="grid grid-cols-2 gap-1.5">
              {AMBIENT_PRESET_IDS.map((preset) => (
                <ToggleButton
                  key={preset}
                  value={preset}
                  checked={ambientPresetId === preset}
                  onChange={({ checked }) => {
                    if (!checked) return
                    setAmbientPresetId(preset)
                    trackAmbientPresetChange({ preset })
                    posthog.capture('ambient_preset_change', { preset })
                  }}
                  color="neutral"
                  selectedColor="primary"
                  variant="solid"
                >
                  {PRESET_LABELS[preset]}
                </ToggleButton>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (isFullscreen) {
    return (
      <Modal active onClose={onClose} ariaLabel="Sound" containerRef={containerRef}>
        {card}
      </Modal>
    )
  }

  return (
    <Popover
      active
      onClose={onClose}
      positionRef={triggerRef}
      position="bottom-start"
      width="min(320px, calc(100vw - 32px))"
      containerRef={containerRef}
    >
      <Popover.Content>{card}</Popover.Content>
    </Popover>
  )
}
