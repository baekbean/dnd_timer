'use client'

import { Popover, Slider, ToggleButton, ToggleButtonGroup } from 'reshaped'
import type { Scene } from '@/lib/timer/scenes'
import { useTimerStore, type SoundSource } from '@/lib/timer/store'
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

// Speaker cone + two sound-wave arcs (traced from the trigger pill's
// speaker-icon.svg). Split into separate paths so the wave arcs can be
// dropped when muted, instead of just dimming the whole glyph.
function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="14" height="12" viewBox="0 0 11.4471 8.82292" fill="none" aria-hidden="true">
      <path
        d="M5.39616 8.82292C5.76542 8.82292 6.03621 8.5472 6.03621 8.18286V0.664673C6.03621 0.29541 5.76542 0 5.38631 0C5.13521 0 4.95797 0.108317 4.68717 0.364339L2.62915 2.28943C2.59961 2.31897 2.56022 2.33374 2.51591 2.33374H1.12256C0.39388 2.33374 0 2.73747 0 3.50061V5.33215C0 6.0953 0.39388 6.49902 1.12256 6.49902H2.51591C2.56022 6.49902 2.59469 6.51379 2.62915 6.54333L4.68717 8.48319C4.93335 8.71952 5.14014 8.82292 5.39616 8.82292Z"
        fill="#343434"
      />
      {!muted && (
        <>
          <path
            d="M9.77315 7.92192C9.99963 8.05977 10.2754 8.01054 10.4329 7.77913C11.073 6.87321 11.4471 5.6571 11.4471 4.40653C11.4471 3.15597 11.0779 1.93494 10.4329 1.03394C10.2754 0.802531 9.99963 0.748372 9.77315 0.891154C9.53682 1.03886 9.50236 1.33427 9.67961 1.59521C10.2015 2.36328 10.5018 3.36275 10.5018 4.40653C10.5018 5.44539 10.1966 6.44486 9.67961 7.21785C9.50728 7.4788 9.53682 7.76929 9.77315 7.92192Z"
            fill="#343434"
          />
          <path
            d="M7.7939 6.60242C8.00562 6.74027 8.28133 6.69104 8.43396 6.47441C8.83276 5.94267 9.06909 5.18937 9.06909 4.40653C9.06909 3.6237 8.83276 2.87533 8.43396 2.33866C8.28133 2.12203 8.00562 2.07279 7.7939 2.21558C7.55265 2.37313 7.50342 2.66361 7.70036 2.94918C7.97115 3.33813 8.12378 3.86003 8.12378 4.40653C8.12378 4.95304 7.96623 5.47001 7.70036 5.86389C7.50834 6.14945 7.55265 6.43994 7.7939 6.60242Z"
            fill="#343434"
          />
        </>
      )}
    </svg>
  )
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
}: {
  soundOn: boolean
  onToggleSoundOn: (next: boolean) => void
  name: string
  value: number
  onChangeValue: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-[rgba(52,52,52,0.06)] py-2 pl-3 pr-4">
      <button
        type="button"
        aria-pressed={!soundOn}
        aria-label={soundOn ? 'Mute' : 'Unmute'}
        onClick={() => onToggleSoundOn(!soundOn)}
        className="flex h-6 w-6 shrink-0 items-center justify-center"
      >
        <SpeakerIcon muted={!soundOn} />
      </button>
      <div className="min-w-0 flex-1">
        <Slider
          name={name}
          value={Math.round(value * 100)}
          onChange={({ value }) => onChangeValue(value / 100)}
          disabled={!soundOn}
        />
      </div>
    </div>
  )
}

interface Props {
  scene: Scene
  /** Element the popover is anchored to — the "Sound" pill in TimerApp. */
  triggerRef?: React.RefObject<HTMLElement | null>
  onClose: () => void
}

export default function SoundPanel({ scene, triggerRef, onClose }: Props) {
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

  return (
    <Popover
      active
      onClose={onClose}
      positionRef={triggerRef}
      position="bottom-start"
      width="min(320px, calc(100vw - 32px))"
    >
      <Popover.Content>
        <div role="dialog" aria-label="Sound">
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
              onToggleSoundOn={(checked) => {
                trackSoundToggle({ sound_on: checked })
                posthog.capture('sound_change', { sound_on: checked })
                setSoundOn(checked)
              }}
              name={activeVolumeName}
              value={activeVolume}
              onChangeValue={setActiveVolume}
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
      </Popover.Content>
    </Popover>
  )
}
