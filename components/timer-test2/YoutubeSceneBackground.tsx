'use client'

import type { Scene } from '@/lib/timer/scenes'

const TEST_YOUTUBE_ID = 'z9Ug-3qhrwY'

function youtubeEmbedSrc(videoId: string) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    disablekb: '1',
    fs: '0',
    iv_load_policy: '3',
    loop: '1',
    playlist: videoId,
    playsinline: '1',
    rel: '0',
  })

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
}

export default function YoutubeSceneBackground({ scene }: { scene: Scene }) {
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
        <iframe
          key={TEST_YOUTUBE_ID}
          title="Test YouTube background"
          src={youtubeEmbedSrc(TEST_YOUTUBE_ID)}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        />
        {scene.overlay && <div className="absolute inset-0" style={{ background: scene.overlay }} />}
      </div>
    </div>
  )
}
