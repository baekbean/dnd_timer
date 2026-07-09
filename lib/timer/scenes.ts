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
      poster: '/images/timer-bg.png',
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

export function getScene(id: string): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0]
}
