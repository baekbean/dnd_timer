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
    // Dummy alternates — gradient-only until real scene assets are produced
    id: 'dusk',
    name: 'Dusk',
    fallbackGradient: 'linear-gradient(160deg, #46536b 0%, #6b7a8f 55%, #93a3b5 100%)',
    ambient: { kind: 'noise' },
  },
  {
    id: 'night',
    name: 'Night',
    fallbackGradient: 'linear-gradient(160deg, #22233a 0%, #3a3a5c 55%, #50507a 100%)',
    ambient: { kind: 'noise' },
  },
]

export const DEFAULT_SCENE_ID = SCENES[0].id

export function getScene(id: string): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0]
}
