'use client'

import { SCENES } from '@/lib/timer/scenes'
import { useTimerStore } from '@/lib/timer/store'
import { trackSceneChange, trackSceneExposure } from '@/lib/ga'
import { markSceneEntered, msSinceSceneEntered } from '@/lib/timer/exposureTracking'
import posthog from 'posthog-js'

export default function ScenePicker() {
  const sceneId = useTimerStore((s) => s.sceneId)
  const setScene = useTimerStore((s) => s.setScene)

  return (
    <div className="flex items-center gap-3">
      {SCENES.map((scene) => {
        const active = scene.id === sceneId
        return (
          <button
            key={scene.id}
            type="button"
            aria-label={`Scene: ${scene.name}`}
            aria-pressed={active}
            title={scene.name}
            onClick={() => {
              if (scene.id !== sceneId) {
                // Log the OUTGOING scene's exposure before switching — this is
                // what lets the default scene's usage be measured too, since it
                // never gets a "switch to" event of its own.
                const duration_ms = msSinceSceneEntered()
                trackSceneExposure({ scene_id: sceneId, duration_ms, ended_reason: 'switched' })
                posthog.capture('scene_exposure', {
                  scene_id: sceneId,
                  duration_ms,
                  ended_reason: 'switched',
                })

                trackSceneChange({ scene_id: scene.id })
                posthog.capture('scene_change', { scene_id: scene.id })
                markSceneEntered()
              }
              setScene(scene.id)
            }}
            className="h-10 w-[60px] rounded-xl bg-cover bg-center transition-all"
            style={{
              background: scene.backgroundImage
                ? `url(${scene.backgroundImage})`
                : scene.fallbackGradient,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: active
                ? '0 0 0 2px rgba(246,246,243,0.9), 0 2px 8px rgba(0,0,0,0.25)'
                : '0 0 0 1px rgba(246,246,243,0.25), 0 2px 8px rgba(0,0,0,0.15)',
              opacity: active ? 1 : 0.75,
            }}
          />
        )
      })}
    </div>
  )
}
