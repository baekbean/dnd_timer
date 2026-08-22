import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Footer from '@/components/Footer'
import { SITE_NAME } from '@/lib/seo'

describe('Footer', () => {
  it('uses the canonical brand name in the copyright notice', () => {
    render(<Footer />)

    expect(screen.getByText(`© 2026 ${SITE_NAME}`)).toBeTruthy()
    expect(screen.queryByText(/© 2026 Nook Timer/)).toBeNull()
  })
})
