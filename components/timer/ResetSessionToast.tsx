'use client'

import { useEffect } from 'react'

const AUTO_DISMISS_MS = 4500

export default function ResetSessionToast({
  onConfirm,
  onDismiss,
}: {
  onConfirm: () => void
  onDismiss: () => void
}) {
  useEffect(() => {
    const id = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(id)
  }, [onDismiss])

  return (
    <>
      {/* Full-screen catcher — click anywhere outside the toast to dismiss */}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="fixed inset-0 z-40 cursor-default"
      />
      <div
        role="alertdialog"
        aria-label="Reset full session?"
        className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-full px-5 py-3 md:bottom-28"
        style={{
          background: 'rgba(28,28,28,0.85)',
          border: '0.5px solid rgba(246,246,243,0.15)',
          backdropFilter: 'blur(10px)',
          animation: 'dndToastIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        <span className="whitespace-nowrap text-[13px] text-[#f5f5f5] md:text-[14px]">
          Reset full session too?
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-[#f6f6f3] transition-opacity hover:opacity-80"
            style={{ background: 'rgba(246,246,243,0.2)' }}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] text-[#f5f5f5]/70 transition-opacity hover:opacity-90"
          >
            No
          </button>
        </div>
      </div>
      <style>{`@keyframes dndToastIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
    </>
  )
}
