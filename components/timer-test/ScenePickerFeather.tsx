'use client'

import { SCENES } from '@/lib/timer/scenes'
import { useTimerStore } from '@/lib/timer/store'
import { trackSceneChange } from '@/lib/ga'

export default function ScenePickerFeather({ compact = false }: { compact?: boolean }) {
  const sceneId = useTimerStore((s) => s.sceneId)
  const setScene = useTimerStore((s) => s.setScene)

  return (
    <div className="flex items-end gap-3">
      {SCENES.map((scene, i) => {
        const active = scene.id === sceneId
        const tilt = i % 2 === 0 ? '-2deg' : '3deg'
        return (
          <button
            key={scene.id}
            type="button"
            aria-label={`Scene: ${scene.name}`}
            aria-pressed={active}
            onClick={() => {
              if (scene.id !== sceneId) trackSceneChange({ scene_id: scene.id })
              setScene(scene.id)
            }}
            className="relative flex flex-col items-center transition-transform hover:-translate-y-0.5"
            style={{ transform: active ? 'rotate(0deg)' : `rotate(${tilt})` }}
          >
            {active && (
              <span
                className="absolute -top-2 left-1/2 h-3 w-9 -translate-x-1/2"
                style={{ background: 'rgba(201,123,82,0.55)', transform: 'rotate(-3deg)' }}
              />
            )}
            <span
              className={compact ? 'h-9 w-14 rounded-[8px]' : 'h-11 w-16 rounded-[10px]'}
              style={{
                background: scene.fallbackGradient,
                boxShadow: active
                  ? '0 0 0 2px #FEFEFB, 0 4px 10px rgba(52,52,52,0.18)'
                  : '0 4px 10px rgba(52,52,52,0.12)',
              }}
            />
            <span
              className="mt-1.5 text-[11px]"
              style={{ color: active ? '#343434' : '#9a988e', fontFamily: 'var(--font-pretendard)' }}
            >
              {scene.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
