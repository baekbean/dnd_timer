import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MobileHandoffSheet from '@/components/timer/MobileHandoffSheet'
import {
  trackMobileHandoffContinue,
  trackMobileHandoffDismiss,
  trackMobileHandoffEmailOpen,
  trackMobileHandoffEmailSubmit,
  trackMobileHandoffHideToday,
  trackMobileHandoffShare,
  trackMobileHandoffView,
} from '@/lib/ga'

vi.mock('@/lib/ga', () => ({
  trackMobileHandoffView: vi.fn(),
  trackMobileHandoffDismiss: vi.fn(),
  trackMobileHandoffContinue: vi.fn(),
  trackMobileHandoffShare: vi.fn(),
  trackMobileHandoffEmailOpen: vi.fn(),
  trackMobileHandoffEmailSubmit: vi.fn(),
  trackMobileHandoffHideToday: vi.fn(),
}))

vi.mock('@/lib/constants', () => ({ submitEmailSilently: vi.fn() }))

describe('MobileHandoffSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    localStorage.clear()
    sessionStorage.clear()
    vi.setSystemTime(new Date(2026, 6, 17, 12))
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: (callback: FrameRequestCallback) => window.setTimeout(callback, 0),
    })
    Object.defineProperty(window, 'cancelAnimationFrame', {
      configurable: true,
      writable: true,
      value: window.clearTimeout,
    })
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
  })

  it('renders the refreshed copy and actions without a standalone Copy link', () => {
    render(<MobileHandoffSheet onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Looks even better on a bigger screen' })).toBeTruthy()
    expect(screen.getByText(/where it feels most at home/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Continue on mobile' })).toBeTruthy()
    expect(screen.getByRole('button', { name: "Don't show again today" })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Copy link' })).toBeNull()
    expect(trackMobileHandoffView).toHaveBeenCalledOnce()
  })

  it('closes for this page only when Continue on mobile is chosen', () => {
    const onClose = vi.fn()
    render(<MobileHandoffSheet onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Continue on mobile' }))
    act(() => vi.advanceTimersByTime(260))

    expect(trackMobileHandoffContinue).toHaveBeenCalledOnce()
    expect(localStorage.getItem('dnd-handoff-hide-date')).toBeNull()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('stores today and tracks the explicit daily opt-out', () => {
    const onClose = vi.fn()
    render(<MobileHandoffSheet onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: "Don't show again today" }))
    act(() => vi.advanceTimersByTime(260))

    expect(trackMobileHandoffHideToday).toHaveBeenCalledOnce()
    expect(localStorage.getItem('dnd-handoff-hide-date')).toBe('2026-07-17')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('tracks close-button dismissals without setting the daily opt-out', () => {
    const onClose = vi.fn()
    render(<MobileHandoffSheet onClose={onClose} />)

    const close = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(close)
    fireEvent.click(close)
    act(() => vi.advanceTimersByTime(260))

    expect(trackMobileHandoffDismiss).toHaveBeenCalledWith({ method: 'close_button' })
    expect(trackMobileHandoffDismiss).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
    expect(localStorage.getItem('dnd-handoff-hide-date')).toBeNull()
  })

  it('tracks a completed native share and closes the sheet', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    render(<MobileHandoffSheet onClose={onClose} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send to another device' }))
      await Promise.resolve()
    })
    act(() => vi.advanceTimersByTime(260))

    expect(share).toHaveBeenCalledOnce()
    expect(trackMobileHandoffShare).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('keeps the sheet open and does not track when native sharing is cancelled', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')),
    })
    const onClose = vi.fn()
    render(<MobileHandoffSheet onClose={onClose} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send to another device' }))
      await Promise.resolve()
    })
    act(() => vi.runAllTimers())

    expect(trackMobileHandoffShare).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('tracks backdrop dismissal without setting the daily opt-out', () => {
    const onClose = vi.fn()
    render(<MobileHandoffSheet onClose={onClose} />)

    const backdrop = screen.getByRole('button', { name: 'Dismiss' })
    fireEvent.click(backdrop)
    act(() => vi.advanceTimersByTime(260))

    expect(trackMobileHandoffDismiss).toHaveBeenCalledWith({ method: 'backdrop' })
    expect(localStorage.getItem('dnd-handoff-hide-date')).toBeNull()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('reveals the email input when "Email me the link" is clicked', () => {
    render(<MobileHandoffSheet onClose={vi.fn()} />)

    expect(screen.queryByLabelText('Email address')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Email me the link' }))

    expect(screen.getByLabelText('Email address')).toBeTruthy()
    expect(trackMobileHandoffEmailOpen).toHaveBeenCalledOnce()
  })

  it('shows an inline error and does not submit when an invalid email is entered', () => {
    render(<MobileHandoffSheet onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Email me the link' }))

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'not-an-email' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Send link' }).closest('form')!)

    expect(screen.getByText(/doesn't look like an email/)).toBeTruthy()
    expect(trackMobileHandoffEmailSubmit).not.toHaveBeenCalled()
  })

  it('shows the success state and fires the submit event when a valid email is entered', () => {
    Object.defineProperty(window, 'location', { configurable: true, writable: true, value: { href: 'http://localhost' } })
    render(<MobileHandoffSheet onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Email me the link' }))

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'user@example.com' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Send link' }).closest('form')!)

    expect(trackMobileHandoffEmailSubmit).toHaveBeenCalledOnce()
    expect(screen.getByText('Almost there!')).toBeTruthy()
  })

  it('copies the link when native sharing fails for a reason other than cancellation', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new DOMException('blocked', 'NotAllowedError')),
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    })
    render(<MobileHandoffSheet onClose={vi.fn()} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send to another device' }))
      await Promise.resolve()
    })

    expect(trackMobileHandoffShare).toHaveBeenCalledOnce()
    expect(screen.getByRole('status').textContent).toContain('Link copied')
    expect(document.querySelector('textarea')).toBeNull()
  })
})
