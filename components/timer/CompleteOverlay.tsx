'use client'

import { useEffect } from 'react'

const AUTO_DISMISS_MS = 8000

export default function CompleteOverlay({
  sessionsToday,
  onDismiss,
}: {
  sessionsToday: number
  onDismiss: () => void
}) {
  useEffect(() => {
    const id = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(id)
  }, [onDismiss])

  return (
    <button
      type="button"
      aria-label="Dismiss"
      onClick={onDismiss}
      className="absolute inset-0 z-30 flex cursor-default flex-col items-center justify-center gap-5 bg-black/35 backdrop-blur-[6px]"
      style={{ animation: 'dndFadeIn 0.6s ease both' }}
    >
      <p className="text-[15px] uppercase tracking-[0.2em] text-[#f5f5f5]/80 md:text-[16px]">
        Focus session complete
      </p>
      <span
        className="leading-none text-[#f6f6f3]"
        style={{
          fontFamily: 'var(--font-din-condensed)',
          fontWeight: 700,
          fontSize: 'clamp(64px, 14vw, 280px)',
          letterSpacing: '-0.02em',
        }}
      >
        {sessionsToday}
      </span>
      <p className="text-[14px] text-[#f5f5f5]/70 md:text-[15px]">
        {sessionsToday === 1 ? 'session today' : 'sessions today'}
      </p>
      <style>{`@keyframes dndFadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </button>
  )
}
