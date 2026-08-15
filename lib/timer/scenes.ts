import { customVideoOverlay } from '@/lib/timer/legibility'

export interface SceneAmbientFile {
  kind: 'file'
  src: string
}

/** Placeholder ambient until real sound assets are produced — synthesized noise. */
export interface SceneAmbientNoise {
  kind: 'noise'
}

export interface Scene {
  id: string
  name: string
  video?: {
    webm?: string
    mp4?: string
    poster?: string
  }
  /** Static background image, used when there's no video for the scene. */
  backgroundImage?: string
  /** A YouTube video standing in for the background — user-supplied, see CUSTOM_SCENE_ID. */
  youtube?: { videoId: string }
  /** Shown behind/instead of video while it loads or if it fails. */
  fallbackGradient: string
  /** Color wash over the video, matching the landing hero treatment. */
  overlay?: string
  ambient: SceneAmbientFile | SceneAmbientNoise
}

export const SCENES: Scene[] = [
  {
    // Dummy signature scene — reuses the landing hero background until real assets land
    id: 'signature',
    name: 'Signature',
    video: {
      webm: '/images/timer-bg.webm',
      mp4: '/images/timer-bg.mp4',
      poster: '/images/timer-bg.jpg',
    },
    fallbackGradient: 'linear-gradient(160deg, #5c6b57 0%, #74856E 55%, #8a9a83 100%)',
    overlay: 'rgba(116, 133, 110, 0.3)',
    ambient: { kind: 'noise' },
  },
  {
    id: 'meadow',
    name: 'Meadow',
    backgroundImage: '/images/scene-meadow.jpg',
    fallbackGradient: 'linear-gradient(160deg, #3fc9be 0%, #7ecb8f 55%, #eef0c6 100%)',
    ambient: { kind: 'noise' },
  },
  {
    id: 'dusk',
    name: 'Dusk',
    backgroundImage: '/images/scene-dusk.jpg',
    fallbackGradient: 'linear-gradient(160deg, #e838d0 0%, #6a3aa8 55%, #0d0714 100%)',
    ambient: { kind: 'noise' },
  },
  {
    id: 'night',
    name: 'Night',
    backgroundImage: '/images/scene-night.jpg',
    fallbackGradient: 'linear-gradient(160deg, #9a8ef0 0%, #3a3168 55%, #0a0812 100%)',
    ambient: { kind: 'noise' },
  },
]

export const DEFAULT_SCENE_ID = SCENES[0].id

/** The one user-owned scene slot — never a member of SCENES. */
export const CUSTOM_SCENE_ID = 'custom'

/** Ships in the custom slot so it plays something the moment it's picked. */
export const DEFAULT_CUSTOM_YOUTUBE_ID = 'z9Ug-3qhrwY'

export function getScene(id: string): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0]
}

export function buildCustomScene(videoId: string): Scene {
  return {
    id: CUSTOM_SCENE_ID,
    name: 'My video',
    youtube: { videoId },
    fallbackGradient: 'linear-gradient(160deg, #2b2b30 0%, #1a1a1f 55%, #0c0c10 100%)',
    // A flat wash over the whole video — simpler than a centered vignette,
    // but weaker against bright content; see lib/timer/legibility.ts's
    // contrastRatio tests for exactly where this falls short of WCAG AA.
    overlay: customVideoOverlay,
    // Only used when customSoundSource is 'app' (see TimerApp) — otherwise
    // the video's own audio plays instead.
    ambient: { kind: 'noise' },
  }
}

/**
 * The scene lookup every caller should use. `getScene` alone silently resolves
 * the custom id to SCENES[0], so anything reading `sceneId` straight out of the
 * store has to come through here or the custom background disappears.
 */
export function resolveScene(sceneId: string, customYoutubeId: string): Scene {
  return sceneId === CUSTOM_SCENE_ID ? buildCustomScene(customYoutubeId) : getScene(sceneId)
}
