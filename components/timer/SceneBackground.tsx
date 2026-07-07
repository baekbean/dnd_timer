'use client'

import type { Scene } from '@/lib/timer/scenes'

export default function SceneBackground({ scene }: { scene: Scene }) {
  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden"
      style={{ background: scene.fallbackGradient }}
    >
      {scene.video && (
        <video
          key={scene.id}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={scene.video.poster}
        >
          {scene.video.webm && <source src={scene.video.webm} type="video/webm" />}
          {scene.video.mp4 && <source src={scene.video.mp4} type="video/mp4" />}
        </video>
      )}
      {scene.overlay && <div className="absolute inset-0" style={{ background: scene.overlay }} />}
    </div>
  )
}
