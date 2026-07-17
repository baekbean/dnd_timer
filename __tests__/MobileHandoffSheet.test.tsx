import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MobileHandoffSheet from '@/components/timer/MobileHandoffSheet'
import {
  trackMobileHandoffContinue,
  trackMobileHandoffDismiss,
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
    render(<MobileHandoffSheet onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(trackMobileHandoffDismiss).toHaveBeenCalledWith({ method: 'close_button' })
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
      value: vi.fn().mockRejectedValue(new Error('cancelled')),
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
})
