'use client'

/**
 * Ephemeral (non-persisted) timestamp used only for analytics duration
 * calculations — how long the current scene has been on screen.
 *
 * Deliberately kept OUTSIDE the zustand store (lib/timer/store.ts) so this
 * never gets written to localStorage or resurrected on reload. It's runtime
 * bookkeeping for scene_exposure, not app state.
 */

let sceneEnteredAt = Date.now()

/** Call whenever the active scene changes (including once after rehydration
 * settles on the persisted scene, so the clock starts on the scene the user
 * is actually seeing rather than DEFAULT_SCENE_ID). */
export function markSceneEntered() {
  sceneEnteredAt = Date.now()
}

/** Ms the current scene has been on screen since the last markSceneEntered(). */
export function msSinceSceneEntered(): number {
  return Date.now() - sceneEnteredAt
}
