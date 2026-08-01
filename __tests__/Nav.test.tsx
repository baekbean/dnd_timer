import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Nav from '@/components/Nav'
import { trackStartFocusingClick } from '@/lib/ga'

vi.mock('@/lib/ga', () => ({
  trackStartFocusingClick: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

describe('Nav CTA', () => {
  it('links straight to the timer and tracks start_focusing_click', () => {
    render(<Nav />)

    const cta = screen.getByRole('link', { name: 'Start focusing' })
    expect(cta.getAttribute('href')).toBe('/')

    fireEvent.click(cta)

    expect(trackStartFocusingClick).toHaveBeenCalledWith({ button_location: 'nav' })
  })
})
