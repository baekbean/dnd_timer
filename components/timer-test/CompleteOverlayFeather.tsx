'use client'

import { useEffect } from 'react'

const AUTO_DISMISS_MS = 8000

export default function CompleteOverlayFeather({
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
      className="absolute inset-0 z-30 flex cursor-default items-center justify-center bg-black/30 p-4 backdrop-blur-[4px]"
      style={{ animation: 'featherFadeIn 0.5s ease both' }}
    >
      <div
        className="relative flex w-full max-w-[300px] flex-col items-center gap-3 px-8 py-9"
        style={{
          background: '#FEFEFB',
          borderRadius: '4px 4px 4px 18px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
        }}
      >
        <span
          className="absolute right-0 top-0 h-0 w-0"
          style={{ borderStyle: 'solid', borderWidth: '0 20px 20px 0', borderColor: 'transparent #E9E6DB transparent transparent' }}
        />
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
          style={{ background: '#E4E9DE', color: '#4C5A45' }}
        >
          SESSION COMPLETE
        </span>
        <span
          className="leading-none text-[#343434]"
          style={{
            fontFamily: 'var(--font-din-condensed)',
            fontWeight: 700,
            fontSize: 'clamp(56px, 12vw, 96px)',
            letterSpacing: '-0.02em',
          }}
        >
          {sessionsToday}
        </span>
        <p className="text-[13px]" style={{ color: '#9a988e', fontFamily: 'var(--font-pretendard)' }}>
          {sessionsToday === 1 ? 'session today' : 'sessions today'}
        </p>
        <span
          className="mt-1 rounded-full px-5 py-2 text-[13px] font-medium"
          style={{ background: '#74856E', color: '#F6F6F3' }}
        >
          Start break
        </span>
      </div>
      <style>{`@keyframes featherFadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </button>
  )
}
