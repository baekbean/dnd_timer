import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BlogPage from '@/app/blog/page'
import BlogPostPage, { generateMetadata, generateStaticParams } from '@/app/blog/[slug]/page'
import { FEEDBACK_FORM_URL } from '@/lib/constants'
import { blogPostingJsonLd, faqPageJsonLd } from '@/lib/seo'
import * as blogModule from '@/lib/blog'
import { BLOG_POSTS, getBlogPost, type BlogBlock } from '@/lib/blog'

vi.mock('@/lib/ga', () => ({
  trackStartFocusingClick: vi.fn(),
  trackFeedbackClick: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

const post = BLOG_POSTS[0]
const faqBlock = post.blocks.find(
  (block): block is Extract<BlogBlock, { type: 'faq' }> => block.type === 'faq'
)!

describe('getBlogPost', () => {
  it('resolves a known slug', () => {
    expect(getBlogPost(post.slug)?.title).toBe(post.title)
  })

  it('returns undefined for an unknown slug', () => {
    expect(getBlogPost('not-a-real-post')).toBeUndefined()
  })
})

describe('blogPostingJsonLd', () => {
  it('builds a BlogPosting entry pointing at /blog', () => {
    const jsonLd = blogPostingJsonLd(post, '/blog')
    expect(jsonLd['@type']).toBe('BlogPosting')
    expect(jsonLd.headline).toBe(post.title)
    expect(jsonLd.datePublished).toBe(post.date)
    expect(jsonLd.url).toBe(`https://nooktimer.com/blog/${post.slug}`)
  })
})

describe('faqPageJsonLd', () => {
  it('mirrors the post FAQ block one-to-one', () => {
    const jsonLd = faqPageJsonLd(faqBlock.items)
    expect(jsonLd['@type']).toBe('FAQPage')
    expect(jsonLd.mainEntity).toHaveLength(faqBlock.items.length)
    jsonLd.mainEntity.forEach((entity, i) => {
      expect(entity.name).toBe(faqBlock.items[i].question)
      expect(entity.acceptedAnswer.text).toBe(faqBlock.items[i].answer)
    })
  })
})

describe('generateStaticParams', () => {
  it('returns one entry per post', () => {
    const params = generateStaticParams()
    expect(params).toHaveLength(BLOG_POSTS.length)
    expect(params.map((p) => p.slug)).toEqual(BLOG_POSTS.map((p) => p.slug))
  })
})

describe('BlogPage (index)', () => {
  it('renders every post title as a link to its post page', () => {
    render(<BlogPage />)
    for (const p of BLOG_POSTS) {
      const link = screen.getByRole('link', { name: p.title })
      expect(link.getAttribute('href')).toBe(`/blog/${p.slug}`)
    }
  })
})

describe('BlogPostPage', () => {
  it('renders the title/lede and exactly two JSON-LD scripts (BlogPosting + FAQPage)', async () => {
    const element = await BlogPostPage({ params: Promise.resolve({ slug: post.slug }) })
    const { container } = render(element)

    expect(screen.getByRole('heading', { level: 1, name: post.title })).toBeTruthy()
    expect(screen.getByText(post.lede[0])).toBeTruthy()

    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts).toHaveLength(2)
    const types = Array.from(scripts).map(
      (s) => (JSON.parse(s.innerHTML) as { '@type': string })['@type']
    )
    expect(types).toContain('BlogPosting')
    expect(types).toContain('FAQPage')
  })

  it('renders a feedback link to the Google Form', async () => {
    const element = await BlogPostPage({ params: Promise.resolve({ slug: post.slug }) })
    render(element)

    const link = screen.getByRole('link', { name: /send feedback/i })
    expect(link.getAttribute('href')).toBe(FEEDBACK_FORM_URL)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('returns empty metadata for an unknown slug instead of throwing', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'not-a-real-post' }),
    })
    expect(metadata).toEqual({})
  })

  it('renders "Read next" linking to another post when one exists', async () => {
    expect(BLOG_POSTS.length).toBeGreaterThan(1)
    const otherPost = BLOG_POSTS.find((p) => p.slug !== post.slug)!
    const element = await BlogPostPage({ params: Promise.resolve({ slug: post.slug }) })
    render(element)

    expect(screen.getByRole('heading', { name: /read next/i })).toBeTruthy()
    const link = screen.getByRole('link', { name: otherPost.title })
    expect(link.getAttribute('href')).toBe(`/blog/${otherPost.slug}`)
  })

  it('renders nothing for "Read next" when there are no other posts', async () => {
    vi.spyOn(blogModule, 'sortedBlogPosts').mockReturnValueOnce([post])
    const element = await BlogPostPage({ params: Promise.resolve({ slug: post.slug }) })
    render(element)

    expect(screen.queryByRole('heading', { name: /read next/i })).toBeNull()
  })

  it('tracks start_focusing_click with the callout button_location on the inline CTA', async () => {
    const { trackStartFocusingClick } = await import('@/lib/ga')
    const posthog = (await import('posthog-js')).default
    const element = await BlogPostPage({ params: Promise.resolve({ slug: post.slug }) })
    render(element)

    const calloutBlock = post.blocks.find(
      (block): block is Extract<BlogBlock, { type: 'callout' }> => block.type === 'callout'
    )!
    const cta = screen.getByRole('link', { name: calloutBlock.ctaText })
    fireEvent.click(cta)

    expect(trackStartFocusingClick).toHaveBeenCalledWith({
      button_location: 'blog_post_callout',
    })
    expect(posthog.capture).toHaveBeenCalledWith('start_focusing_click', {
      button_location: 'blog_post_callout',
    })
  })

  it('tracks start_focusing_click with the end-CTA button_location', async () => {
    const { trackStartFocusingClick } = await import('@/lib/ga')
    const posthog = (await import('posthog-js')).default
    const element = await BlogPostPage({ params: Promise.resolve({ slug: post.slug }) })
    render(element)

    const ctaBlock = post.blocks.find(
      (block): block is Extract<BlogBlock, { type: 'cta' }> => block.type === 'cta'
    )!
    const cta = screen.getByRole('link', { name: ctaBlock.buttonText })
    fireEvent.click(cta)

    expect(trackStartFocusingClick).toHaveBeenCalledWith({
      button_location: 'blog_post_end_cta',
    })
    expect(posthog.capture).toHaveBeenCalledWith('start_focusing_click', {
      button_location: 'blog_post_end_cta',
    })
  })
})
