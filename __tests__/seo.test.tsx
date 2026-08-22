import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { metadata } from '@/app/layout'
import SeoContent from '@/components/timer/SeoContent'
import { FEEDBACK_FORM_URL } from '@/lib/constants'
import {
  FAQ_ITEMS,
  faqJsonLd,
  serializeJsonLd,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  webApplicationJsonLd,
} from '@/lib/seo'
import manifest from '@/public/manifest.json'

describe('webApplicationJsonLd', () => {
  it('describes the app as a free web application', () => {
    const jsonLd = webApplicationJsonLd()
    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(jsonLd['@type']).toBe('WebApplication')
    expect(jsonLd.name).toBe(SITE_NAME)
    expect(jsonLd).not.toHaveProperty('alternateName')
    expect(jsonLd.url).toBe(SITE_URL)
    expect(jsonLd.offers.price).toBe('0')
  })

  it('uses a real schema.org applicationCategory enum value', () => {
    // Bare 'Productivity' is not in the enumeration, so crawlers drop the field.
    expect(webApplicationJsonLd().applicationCategory).toBe('ProductivityApplication')
  })
})

describe('root metadata', () => {
  it('reads every description surface from SITE_DESCRIPTION', () => {
    // These were once three hardcoded copies, free to drift apart from each
    // other and from the JSON-LD.
    expect(metadata.description).toBe(SITE_DESCRIPTION)
    expect(metadata.openGraph?.description).toBe(SITE_DESCRIPTION)
    expect(metadata.twitter?.description).toBe(SITE_DESCRIPTION)
  })

  it('keeps the description inside the SERP truncation window', () => {
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160)
  })

  it('keeps the hand-synced manifest description in step', () => {
    // public/manifest.json is static JSON and cannot import SITE_DESCRIPTION,
    // so this is the only thing stopping the two from drifting.
    expect(manifest.description).toBe(SITE_DESCRIPTION)
  })

  it('reads title, canonical URL, and app name from the shared constants', () => {
    // These were also converted from hardcoded literals to imports; guard
    // them the same way as description so a future edit can't desync the
    // title tag, canonical/OG URL, or PWA name from lib/seo.ts.
    expect(metadata.title).toEqual({ default: SITE_TITLE, template: `%s | ${SITE_NAME}` })
    expect(metadata.metadataBase?.toString()).toBe(`${SITE_URL}/`)
    expect(metadata.openGraph?.url).toBe(SITE_URL)
    expect(metadata.openGraph?.siteName).toBe(SITE_NAME)
    expect(metadata.appleWebApp).toMatchObject({ title: SITE_NAME })
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

  it('answers the custom-background query instead of promising future scenes', () => {
    const item = FAQ_ITEMS.find(({ question }) => question === 'Can I use my own background?')

    expect(item?.answer).toBe(
      "Yes. You can paste any YouTube link and use the video as your focus background, or choose one of NookTimer's built-in calming scenes."
    )
    expect(FAQ_ITEMS.some(({ question }) => question === 'Can I change the scenes and sounds?')).toBe(false)
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

  it('surfaces the no-account/no-streaks differentiator in the hero copy', () => {
    render(<SeoContent />)
    expect(screen.getByText(/no account, no\s*streaks/i)).toBeTruthy()
  })

  it('surfaces the custom YouTube background differentiator', () => {
    render(<SeoContent />)
    expect(screen.getByText(/paste any YouTube video to create your own focus background/i)).toBeTruthy()
  })

  it('renders every FAQ question so JSON-LD matches on-page text', () => {
    render(<SeoContent />)
    for (const item of FAQ_ITEMS) {
      expect(screen.getByText(item.question)).toBeTruthy()
      expect(screen.getByText(item.answer)).toBeTruthy()
    }
  })

  it('links to the feedback form', () => {
    render(<SeoContent />)
    const link = screen.getByRole('link', { name: /send feedback/i })
    expect(link.getAttribute('href')).toBe(FEEDBACK_FORM_URL)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('links to the updates page', () => {
    render(<SeoContent />)
    const link = screen.getByRole('link', { name: /check the updates page/i })
    expect(link.getAttribute('href')).toBe('/updates')
  })
})
