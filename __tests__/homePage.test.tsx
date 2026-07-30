import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Home from '@/app/page'

// The timer app is exercised by its own tests — mock it so this test pins
// the page composition itself: structured data emission and the h1 contract.
vi.mock('@/components/timer/TimerApp', () => ({ default: () => <main /> }))

describe('Home page composition', () => {
  it('emits two escaped JSON-LD scripts (WebApplication + FAQPage)', () => {
    const { container } = render(<Home />)
    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts).toHaveLength(2)
    const types = Array.from(scripts).map((s) => {
      expect(s.innerHTML).not.toContain('<')
      return (JSON.parse(s.innerHTML) as { '@type': string })['@type']
    })
    expect(types).toEqual(['WebApplication', 'FAQPage'])
  })

  it('renders exactly one h1', () => {
    const { container } = render(<Home />)
    expect(container.querySelectorAll('h1')).toHaveLength(1)
  })
})
