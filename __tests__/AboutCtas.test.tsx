import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { metadata } from '@/app/about/page'
import Hero from '@/components/Hero'
import Section3 from '@/components/Section3'
import { trackStartFocusingClick } from '@/lib/ga'

vi.mock('@/lib/ga', () => ({
  trackStartFocusingClick: vi.fn(),
}))

vi.mock('@/components/SectionTracker', () => ({ default: () => null }))

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

afterEach(() => {
  vi.clearAllMocks()
})

describe('About page CTAs', () => {
  it('describes the live product instead of a waitlist', () => {
    expect(metadata.description).not.toMatch(/waitlist/i)
    expect(metadata.description).toMatch(/free focus timer/i)
  })

  it('links the hero directly to the timer and tracks its location', () => {
    const { unmount } = render(<Hero />)
    const cta = screen.getByRole('link', { name: 'Start focusing' })

    expect(cta.getAttribute('href')).toBe('/')
    fireEvent.click(cta)
    expect(trackStartFocusingClick).toHaveBeenCalledWith({ button_location: 'about_hero' })
    unmount()
  })

  it('links the final CTA directly to the timer and tracks its location', () => {
    render(<Section3 />)
    const cta = screen.getByRole('link', { name: 'Start focusing' })

    expect(cta.getAttribute('href')).toBe('/')
    fireEvent.click(cta)
    expect(trackStartFocusingClick).toHaveBeenCalledWith({ button_location: 'about_cta' })
  })
})
