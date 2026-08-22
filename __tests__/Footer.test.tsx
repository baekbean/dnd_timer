import { existsSync } from 'node:fs'
import { join } from 'node:path'
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

  it('keeps the decorative texture out of crawler-visible image markup', () => {
    const { container } = render(<Footer />)

    const images = [...container.querySelectorAll('img')]
    expect(images).toHaveLength(1)
    expect(images[0].getAttribute('alt')).toBe(SITE_NAME)

    const decorativeTexture = container.querySelector<HTMLElement>('[aria-hidden="true"]')
    expect(decorativeTexture?.style.backgroundImage).toContain('/images/footer-bg.avif')
    expect(existsSync(join(process.cwd(), 'public/images/footer-bg.avif'))).toBe(true)
  })
})
