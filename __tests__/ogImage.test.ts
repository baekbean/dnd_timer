import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// The OG card is a static metadata file — guard against accidental deletion
// and against size regressions (social crawlers degrade previews on
// oversized images; keep the card well under 300KB).
describe('opengraph-image static assets', () => {
  it('ships a 300KB-max OG card', () => {
    const stat = statSync(join(process.cwd(), 'app/opengraph-image.jpg'))
    expect(stat.size).toBeGreaterThan(0)
    expect(stat.size).toBeLessThan(300 * 1024)
  })

  it('ships non-empty alt text naming the product', () => {
    const alt = readFileSync(join(process.cwd(), 'app/opengraph-image.alt.txt'), 'utf8')
    expect(alt.trim().length).toBeGreaterThan(0)
    expect(alt).toContain('NookTimer')
  })
})
