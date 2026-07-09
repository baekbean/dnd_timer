'use client'

import type { Scene } from '@/lib/timer/scenes'

export default function SceneBackground({ scene }: { scene: Scene }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute overflow-hidden"
        style={{
          inset: 'clamp(12px, 3vw, 24px)',
          borderRadius: 'clamp(24px, 10vw, 200px)',
          background: scene.fallbackGradient,
        }}
      >
        {scene.video && (
          <video
            key={scene.id}
            className="absolute inset-0 h-full w-full object-fill"
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
        {!scene.video && scene.backgroundImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={scene.id}
            src={scene.backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-fill"
          />
        )}
        {scene.overlay && <div className="absolute inset-0" style={{ background: scene.overlay }} />}
      </div>
    </div>
  )
}
