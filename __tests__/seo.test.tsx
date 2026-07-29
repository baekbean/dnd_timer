import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SeoContent from '@/components/timer/SeoContent'
import {
  FAQ_ITEMS,
  faqJsonLd,
  serializeJsonLd,
  SITE_NAME,
  SITE_URL,
  webApplicationJsonLd,
} from '@/lib/seo'

describe('webApplicationJsonLd', () => {
  it('describes the app as a free web application', () => {
    const jsonLd = webApplicationJsonLd()
    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(jsonLd['@type']).toBe('WebApplication')
    expect(jsonLd.name).toBe(SITE_NAME)
    expect(jsonLd.url).toBe(SITE_URL)
    expect(jsonLd.offers.price).toBe('0')
  })
})

describe('faqJsonLd', () => {
  it('mirrors FAQ_ITEMS one-to-one so markup matches visible content', () => {
    const jsonLd = faqJsonLd()
    expect(jsonLd['@type']).toBe('FAQPage')
    expect(jsonLd.mainEntity).toHaveLength(FAQ_ITEMS.length)
    jsonLd.mainEntity.forEach((entity, i) => {
      expect(entity.name).toBe(FAQ_ITEMS[i].question)
      expect(entity.acceptedAnswer.text).toBe(FAQ_ITEMS[i].answer)
    })
  })
})

describe('serializeJsonLd', () => {
  it('escapes < so the payload cannot close the script tag', () => {
    expect(serializeJsonLd({ a: '</script><script>alert(1)' })).not.toContain('<')
  })

  it('round-trips back to the original object', () => {
    const data = { '@type': 'FAQPage', text: 'a </script> b' }
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data)
  })
})

describe('SeoContent', () => {
  it('renders exactly one h1 naming the product category', () => {
    render(<SeoContent />)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0].textContent!.toLowerCase()).toContain('focus timer')
  })

  it('renders every FAQ question so JSON-LD matches on-page text', () => {
    render(<SeoContent />)
    for (const item of FAQ_ITEMS) {
      expect(screen.getByText(item.question)).toBeTruthy()
      expect(screen.getByText(item.answer)).toBeTruthy()
    }
  })

  it('links to the about page', () => {
    render(<SeoContent />)
    const link = screen.getByRole('link', { name: /learn more about the project/i })
    expect(link.getAttribute('href')).toBe('/about')
  })
})
