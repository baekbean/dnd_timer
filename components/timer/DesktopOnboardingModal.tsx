'use client'

import { useEffect, useRef, useState } from 'react'

type BrowserType = 'ios' | 'safari-mac' | 'firefox' | 'chromium' | 'other'

function detectBrowser(): BrowserType {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'
  if (/Firefox\//.test(ua)) return 'firefox'
  if (/Edg\//.test(ua) || (/Chrome\//.test(ua) && !/Chromium/.test(ua))) return 'chromium'
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'safari-mac'
  return 'other'
}

const CONTENT: Record<BrowserType, { title: string; steps: { label: string; detail?: string }[] }> = {
  ios: {
    title: 'Add to Home Screen',
    steps: [
      { label: 'Tap the Share button', detail: 'The □↑ icon in Safari\'s toolbar' },
      { label: 'Tap "Add to Home Screen"' },
      { label: 'Tap "Add" to confirm' },
    ],
  },
  'safari-mac': {
    title: 'Save DnD Timer',
    steps: [
      { label: 'Press ⌘D', detail: 'Adds this page to your bookmarks' },
      { label: 'Or: File → Add to Dock', detail: 'Safari 17+ — opens as a standalone app' },
    ],
  },
  firefox: {
    title: 'Bookmark DnD Timer',
    steps: [
      { label: 'Press ⌘D (Mac) or Ctrl+D (Windows)', detail: 'Saves to your bookmarks bar' },
      { label: 'Or click the ★ in the address bar' },
    ],
  },
  chromium: {
    title: 'Install DnD Timer',
    steps: [
      { label: 'Click ⋮ in the top-right corner' },
      { label: 'Select "Save and share" → "Install page as app"' },
      { label: 'Click "Install" to confirm' },
    ],
  },
  other: {
    title: 'Save DnD Timer',
    steps: [
      { label: 'Press ⌘D (Mac) or Ctrl+D (Windows)', detail: 'Bookmarks this page' },
      { label: 'Or look for "Install" or "Add to Home Screen" in your browser menu' },
    ],
  },
}

export default function DesktopOnboardingModal({ onClose }: { onClose: () => void }) {
  const browser = detectBrowser()
  const { title, steps } = CONTENT[browser]
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [shareSupported] = useState(
    () => browser === 'ios' && typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  )

  useEffect(() => {
    closeButtonRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Do Not Disturb Timer',
        url: window.location.href,
      })
    } catch {
      // User cancelled or share failed — leave modal open
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl px-8 py-8"
        style={{
          background: 'rgba(28,28,28,0.95)',
          border: '0.5px solid rgba(246,246,243,0.15)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full opacity-50 transition-opacity hover:opacity-100"
          style={{ background: 'rgba(246,246,243,0.1)' }}
        >
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="#f5f5f5" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        {/* Title */}
        <p
          id="onboarding-modal-title"
          className="font-pretendard text-[15px] font-semibold leading-snug text-[#f6f6f3]"
        >
          {title}
        </p>
        <p className="mt-1 font-pretendard text-[12px] text-[#f6f6f3]/50">
          Keep DnD Timer one tap away
        </p>

        {/* Steps */}
        <ol className="mt-6 flex flex-col gap-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-pretendard text-[11px] font-semibold text-[#1c1c1c]"
                style={{ background: 'rgba(246,246,243,0.85)' }}
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-pretendard text-[13px] text-[#f6f6f3]">{step.label}</span>
                {step.detail && (
                  <span className="font-pretendard text-[12px] text-[#f6f6f3]/50">{step.detail}</span>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* iOS Share CTA — only shown when Web Share API is available */}
        {shareSupported && (
          <button
            type="button"
            onClick={handleShare}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-pretendard text-[13px] font-semibold text-[#1c1c1c] transition-opacity hover:opacity-90 active:opacity-75"
            style={{ background: 'rgba(246,246,243,0.92)' }}
          >
            {/* iOS Share icon */}
            <svg width="14" height="16" viewBox="0 0 14 18" fill="none">
              <path d="M7 1v11M3 4L7 1l4 3" stroke="#1c1c1c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 9v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9" stroke="#1c1c1c" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Open Share Sheet
          </button>
        )}
      </div>
    </div>
  )
}
