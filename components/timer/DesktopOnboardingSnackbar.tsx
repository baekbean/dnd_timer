'use client'

import { useEffect, useRef, useState } from 'react'
import { trackDesktopOnboardingDismiss, trackDesktopOnboardingInstall, trackDesktopOnboardingModalOpen } from '@/lib/ga'
import { useAddToHomeScreen } from '@/lib/timer/useAddToHomeScreen'
import DesktopOnboardingModal from '@/components/timer/DesktopOnboardingModal'
import posthog from 'posthog-js'

const TRANSITION_MS = 220

// Ignore outside-clicks for a short window after mount so a reflexive click
// right as it appears doesn't burn the day's only exposure before it's read.
const DISMISS_GRACE_MS = 400

const AUTO_DISMISS_MS = 9000

/**
 * Non-modal "Add to Home Screen" snackbar for desktop/iPad. No backdrop —
 * floats over the scene. Positioned bottom-left to stay clear of
 * ResetSessionToast and FocusExtendControl.
 *
 * Visibility policy (device eligibility, daily cap, running-focus guard,
 * standalone-mode check) lives in TimerApp — this component only owns the
 * dismiss interactions and the install CTA.
 *
 * On Chrome/Edge: clicking the CTA triggers the native beforeinstallprompt.
 * On all other browsers: clicking opens a modal with browser-specific
 * step-by-step instructions. The modal must be closed explicitly (no
 * auto-dismiss, no outside-click dismiss) — auto-dismiss is paused while
 * it's open.
 */
export default function DesktopOnboardingSnackbar({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)
  const mountedAtRef = useRef(0)
  const modalOpenRef = useRef(false)
  const { isAvailable, promptInstall } = useAddToHomeScreen()

  useEffect(() => {
    modalOpenRef.current = modalOpen
  }, [modalOpen])

  useEffect(() => {
    mountedAtRef.current = Date.now()
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const closeNow = () => {
    if (closingRef.current) return
    closingRef.current = true
    setVisible(false)
    setTimeout(onClose, TRANSITION_MS)
  }

  // Auto-dismiss — paused while the instructions modal is open.
  useEffect(() => {
    const id = setTimeout(() => {
      if (modalOpenRef.current) return
      trackDesktopOnboardingDismiss({ method: 'auto' })
      posthog.capture('desktop_onboarding_prompt_dismiss', { method: 'auto' })
      closeNow()
    }, AUTO_DISMISS_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Outside-click and Escape dismiss — suppressed while modal is open.
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (modalOpenRef.current) return
      if (Date.now() - mountedAtRef.current < DISMISS_GRACE_MS) return
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        trackDesktopOnboardingDismiss({ method: 'outside_click' })
        posthog.capture('desktop_onboarding_prompt_dismiss', { method: 'outside_click' })
        closeNow()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpenRef.current) return
      if (e.key === 'Escape') {
        trackDesktopOnboardingDismiss({ method: 'escape' })
        posthog.capture('desktop_onboarding_prompt_dismiss', { method: 'escape' })
        closeNow()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = () => {
    trackDesktopOnboardingDismiss({ method: 'close_button' })
    posthog.capture('desktop_onboarding_prompt_dismiss', { method: 'close_button' })
    closeNow()
  }

  const handleInstallClick = async () => {
    if (isAvailable) {
      // Chrome/Edge — trigger native install prompt
      const outcome = await promptInstall()
      if (outcome === 'unavailable') return
      trackDesktopOnboardingInstall({ outcome })
      posthog.capture('desktop_onboarding_install', { outcome })
      if (outcome === 'accepted') closeNow()
    } else {
      // Safari / Firefox / other — open step-by-step instructions modal
      trackDesktopOnboardingModalOpen()
      posthog.capture('desktop_onboarding_modal_open')
      setModalOpen(true)
    }
  }

  return (
    <>
      <div
        ref={rootRef}
        role="status"
        aria-live="polite"
        className="fixed bottom-[60px] left-[60px] z-40 flex items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-3 transition-all"
        style={{
          background: 'rgba(28,28,28,0.85)',
          border: '0.5px solid rgba(246,246,243,0.15)',
          backdropFilter: 'blur(10px)',
          opacity: visible ? 1 : 0,
          transform: `translateY(${visible ? '0' : '8px'})`,
          transitionDuration: `${TRANSITION_MS}ms`,
        }}
      >
        <span className="font-pretendard text-[13px] text-[#f5f5f5]">Keep DnD Timer one tap away</span>

        <button
          type="button"
          onClick={handleInstallClick}
          className="font-pretendard text-[13px] font-semibold text-[#F6F6F3] underline underline-offset-[3px] transition-opacity hover:opacity-80"
        >
          {isAvailable ? 'Add to Home Screen' : 'How to save →'}
        </button>

        <button
          type="button"
          aria-label="Dismiss"
          onClick={handleClose}
          className="flex items-center opacity-60 transition-opacity hover:opacity-100"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="#f5f5f5" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {modalOpen && (
        <DesktopOnboardingModal onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
