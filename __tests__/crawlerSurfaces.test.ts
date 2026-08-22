import { describe, expect, it } from 'vitest'
import { GET as getLlmsTxt } from '@/app/llms.txt/route'
import sitemap from '@/app/sitemap'
import { BLOG_POSTS } from '@/lib/blog'
import { FAQ_ITEMS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo'
import { UPDATE_POSTS } from '@/lib/updates'

describe('llms.txt', () => {
  it('publishes a plain-text map generated from the canonical content sources', async () => {
    const response = await getLlmsTxt()
    const body = await response.text()

    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(body).toContain(`# ${SITE_NAME}`)
    expect(body).toContain(`> ${SITE_DESCRIPTION}`)
    expect(body).toContain(`${SITE_URL}/`)

    for (const post of [...BLOG_POSTS, ...UPDATE_POSTS]) {
      expect(body).toContain(post.title)
    }
    for (const item of FAQ_ITEMS) {
      expect(body).toContain(item.question)
      expect(body).toContain(item.answer)
    }
  })
})

describe('sitemap', () => {
  it('contains the canonical static, blog, and update URLs exactly once', () => {
    const urls = sitemap().map((entry) => entry.url)
    const expectedUrls = [
      SITE_URL,
      `${SITE_URL}/about`,
      `${SITE_URL}/updates`,
      `${SITE_URL}/blog`,
      ...UPDATE_POSTS.map((post) => `${SITE_URL}/updates/${post.slug}`),
      ...BLOG_POSTS.map((post) => `${SITE_URL}/blog/${post.slug}`),
    ]

    expect(urls).toEqual(expect.arrayContaining(expectedUrls))
    expect(new Set(urls).size).toBe(urls.length)
  })
})
