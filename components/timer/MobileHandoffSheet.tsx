'use client'

import { useEffect, useRef, useState } from 'react'
import {
  trackMobileHandoffView,
  trackMobileHandoffDismiss,
  trackMobileHandoffContinue,
  trackMobileHandoffShare,
  trackMobileHandoffEmailOpen,
  trackMobileHandoffEmailSubmit,
  trackMobileHandoffHideToday,
} from '@/lib/ga'
import { submitEmailSilently } from '@/lib/constants'
import {
  hasHandoffBeenViewed,
  markHandoffHiddenToday,
  markHandoffViewed,
} from '@/lib/timer/handoffSession'

const SHARE_TITLE = 'DnD Timer'
const SHARE_TEXT = 'Continue your focus session on desktop or iPad.'
const EMAIL_SUBJECT = 'Your DnD Timer is ready'

// Slide-up/fade timing — kept in one place so the enter animation (via rAF)
// and the exit delay (before unmounting) agree.
const TRANSITION_MS = 260

type EmailState = 'closed' | 'input' | 'success'

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function buildMailtoUrl(email: string, url: string): string {
  const body = `Your focus space is ready.\n\nOpen DnD Timer on your desktop or iPad.\n\n${url}`
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(body)}`
}

/**
 * navigator.clipboard only exists in secure contexts (HTTPS / localhost), so
 * plain-HTTP visits — e.g. LAN-IP dev testing from a phone — need the legacy
 * execCommand path as a fallback.
 */
async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to the legacy path
    }
  }
  const ta = document.createElement('textarea')
  try {
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    return ok
  } catch {
    return false
  } finally {
    ta.remove()
  }
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 2L12 12M12 2L2 12" stroke="#343434" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CopiedToast() {
  return (
    <div
      role="status"
      className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-full px-4 py-2 font-pretendard text-[13px] text-[#f5f5f5]"
      style={{
        background: 'rgba(28,28,28,0.85)',
        border: '0.5px solid rgba(246,246,243,0.15)',
        backdropFilter: 'blur(10px)',
        animation: 'dndToastIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      Link copied
      <style>{`@keyframes dndToastIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
    </div>
  )
}

/**
 * Mobile → desktop/iPad handoff bottom sheet. Rendered by TimerApp only on
 * phones, after a 700ms delay, and only once per page view. Cross-page-load
 * suppression is gated in lib/timer/handoffSession.ts.
 *
 * This does not block or gate mobile usage in any way — every exit path
 * (Close, backdrop, "Continue on mobile") just closes the sheet with no
 * redirect, no login, no feature loss. Only "Don't show again today"
 * suppresses it across page loads; everything else closes this view only,
 * so the sheet returns on the next visit.
 *
 * "Email me the link" has no sending backend: the address is logged to the
 * Google Form (same silent-POST pattern as the landing-page waitlist) and
 * the person's own mail app opens pre-filled, addressed to themselves.
 */
export default function MobileHandoffSheet({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false)
  const [emailState, setEmailState] = useState<EmailState>('closed')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [copyToast, setCopyToast] = useState(false)
  const [actionPending, setActionPending] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const actionPendingRef = useRef(false)
  const closingRef = useRef(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))

    if (!hasHandoffBeenViewed()) {
      trackMobileHandoffView()
      markHandoffViewed()
    }

    return () => {
      cancelAnimationFrame(raf)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const currentUrl = () => (typeof window !== 'undefined' ? window.location.href : '')

  /** Plays the exit transition, then unmounts. */
  const closeAfter = (delayMs: number) => {
    if (closingRef.current) return
    closingRef.current = true
    timerRef.current = setTimeout(() => {
      setVisible(false)
      timerRef.current = setTimeout(onClose, TRANSITION_MS)
    }, delayMs)
  }

  const lockAction = (): boolean => {
    if (actionPendingRef.current) return false
    actionPendingRef.current = true
    setActionPending(true)
    return true
  }

  const unlockAction = () => {
    actionPendingRef.current = false
    setActionPending(false)
  }

  const handleClose = (method: 'close_button' | 'backdrop') => {
    if (!lockAction()) return
    trackMobileHandoffDismiss({ method })
    closeAfter(0)
  }

  const handleContinueOnMobile = () => {
    if (!lockAction()) return
    trackMobileHandoffContinue()
    closeAfter(0)
  }

  const handleHideToday = () => {
    if (!lockAction()) return
    trackMobileHandoffHideToday()
    markHandoffHiddenToday()
    closeAfter(0)
  }

  const handlePrimaryShare = async () => {
    if (!lockAction()) return
    const url = currentUrl()

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          unlockAction()
          return
        }
        // Native sharing can fail for reasons other than cancellation (for
        // example a permissions policy). Preserve the CTA by copying instead.
        if (!(await copyText(url))) {
          unlockAction()
          return
        }
        trackMobileHandoffShare()
        setCopyToast(true)
        closeAfter(1400)
        return
      }
      trackMobileHandoffShare()
      closeAfter(0)
      return
    }

    // Web Share API unsupported → fall back straight to copying the link.
    if (!(await copyText(url))) {
      unlockAction()
      return
    }
    trackMobileHandoffShare()
    setCopyToast(true)
    closeAfter(1400)
  }

  const handleEmailOpen = () => {
    if (actionPendingRef.current) return
    trackMobileHandoffEmailOpen()
    setEmailState('input')
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (actionPendingRef.current) return
    actionPendingRef.current = true
    const trimmed = email.trim()
    if (!isValidEmail(trimmed)) {
      setEmailError(true)
      actionPendingRef.current = false
      return
    }
    setEmailError(false)
    submitEmailSilently(trimmed)
    window.location.href = buildMailtoUrl(trimmed, currentUrl())
    trackMobileHandoffEmailSubmit()
    // Success stays visible — the person dismisses manually via Close /
    // backdrop / Continue on mobile after sending from their mail app.
    setEmailState('success')
    actionPendingRef.current = false
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => handleClose('backdrop')}
        className="absolute inset-0 bg-black/30 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Looks even better on a bigger screen"
        className="relative w-full max-w-[480px] rounded-t-[28px] bg-[#F6F6F3] px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 shadow-[0px_-4px_24px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {copyToast && <CopiedToast />}

        <div className="mb-1 flex items-start justify-between gap-4">
          <h2 className="font-aspekta text-[17px] leading-snug text-[#343434]">
            Looks even better on a bigger screen
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => handleClose('close_button')}
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#343434]/5"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-1 font-pretendard text-[14px] leading-relaxed text-[#343434]/65">
          <p>DnD Timer is designed for desktop and iPad, where it feels most at home.</p>
          <p>
            Continue your focus session on a bigger screen whenever you&apos;re ready. 😊
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handlePrimaryShare}
            disabled={actionPending}
            className="w-full rounded-full bg-[#343434] px-5 py-3 font-pretendard text-[15px] text-[#F6F6F3] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Send to another device
          </button>

          <div aria-live="polite" aria-atomic="true">
            {emailState === 'closed' && (
              <button
                type="button"
                onClick={handleEmailOpen}
                disabled={actionPending}
                className="w-full rounded-full border border-[#343434]/15 px-5 py-3 font-pretendard text-[15px] text-[#343434] transition-colors hover:bg-[#343434]/5 disabled:opacity-60"
              >
                Email me the link
              </button>
            )}

            {emailState === 'input' && (
              <form
                onSubmit={handleEmailSubmit}
                className="flex flex-col gap-2 rounded-2xl border border-[#343434]/10 bg-white p-3"
              >
                <label htmlFor="handoff-email" className="font-pretendard text-[12px] text-[#343434]/55">
                  Email address
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="handoff-email"
                    type="email"
                    inputMode="email"
                    autoFocus
                    required
                    disabled={actionPending}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="min-w-0 flex-1 rounded-lg border border-[#343434]/15 bg-[#F6F6F3] px-3 py-2 font-pretendard text-[16px] text-[#343434] outline-none focus:border-[#343434]/40"
                  />
                  <button
                    type="submit"
                    disabled={actionPending || !email.trim()}
                    className="shrink-0 whitespace-nowrap rounded-full bg-[#74856E] px-4 py-2 font-pretendard text-[13px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Send link
                  </button>
                </div>
                {emailError && (
                  <p className="font-pretendard text-[12px] text-[#b3564a]">
                    That doesn&apos;t look like an email address — mind checking it?
                  </p>
                )}
              </form>
            )}

            {emailState === 'success' && (
              <div className="rounded-2xl border border-[#343434]/10 bg-white p-4 text-center">
                <p className="font-pretendard text-[14px] font-medium text-[#343434]">Almost there!</p>
                <p className="mt-1 font-pretendard text-[13px] text-[#343434]/55">
                  We&apos;ve opened your mail app — hit send and the link will be waiting in your inbox.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleContinueOnMobile}
            disabled={actionPending}
            className="mx-auto pt-1 font-pretendard text-[13px] text-[#343434]/55 underline underline-offset-4 transition-colors hover:text-[#343434]"
          >
            Continue on mobile
          </button>

          <button
            type="button"
            onClick={handleHideToday}
            disabled={actionPending}
            className="mx-auto font-pretendard text-[12px] text-[#343434]/40 transition-colors hover:text-[#343434]/70"
          >
            Don&apos;t show again today
          </button>
        </div>
      </div>
    </div>
  )
}
