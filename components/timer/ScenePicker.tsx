'use client'

import { SCENES } from '@/lib/timer/scenes'
import { useTimerStore } from '@/lib/timer/store'

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
            onClick={() => setScene(scene.id)}
            className="h-10 w-16 rounded-lg transition-all"
            style={{
              background: scene.fallbackGradient,
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
