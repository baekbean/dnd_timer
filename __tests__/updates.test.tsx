import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import UpdatesPage from '@/app/updates/page'
import UpdatePostPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/updates/[slug]/page'
import { FEEDBACK_FORM_URL } from '@/lib/constants'
import { blogPostingJsonLd } from '@/lib/seo'
import { getUpdatePost, UPDATE_POSTS } from '@/lib/updates'

describe('getUpdatePost', () => {
  it('resolves a known slug', () => {
    expect(getUpdatePost('new-sounds-and-custom-backgrounds')?.title).toBe(
      'New sounds and a background of your own'
    )
  })

  it('returns undefined for an unknown slug', () => {
    expect(getUpdatePost('not-a-real-post')).toBeUndefined()
  })
})

describe('blogPostingJsonLd', () => {
  it('builds a BlogPosting entry from a post', () => {
    const post = UPDATE_POSTS[0]
    const jsonLd = blogPostingJsonLd(post, '/updates')
    expect(jsonLd['@type']).toBe('BlogPosting')
    expect(jsonLd.headline).toBe(post.title)
    expect(jsonLd.datePublished).toBe(post.date)
    expect(jsonLd.url).toBe(`https://nooktimer.com/updates/${post.slug}`)
  })
})

describe('generateStaticParams', () => {
  it('returns one entry per post', () => {
    const params = generateStaticParams()
    expect(params).toHaveLength(UPDATE_POSTS.length)
    expect(params.map((p) => p.slug)).toEqual(UPDATE_POSTS.map((p) => p.slug))
  })
})

describe('UpdatesPage (index)', () => {
  it('renders every post title as a link to its post page', () => {
    render(<UpdatesPage />)
    for (const post of UPDATE_POSTS) {
      const link = screen.getByRole('link', { name: post.title })
      expect(link.getAttribute('href')).toBe(`/updates/${post.slug}`)
    }
  })
})

describe('UpdatePostPage', () => {
  it('renders the post title/body and exactly one BlogPosting JSON-LD script', async () => {
    const post = UPDATE_POSTS[0]
    const element = await UpdatePostPage({ params: Promise.resolve({ slug: post.slug }) })
    const { container } = render(element)

    expect(screen.getByRole('heading', { level: 1, name: post.title })).toBeTruthy()
    expect(screen.getByText(post.body[0])).toBeTruthy()

    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts).toHaveLength(1)
    const jsonLd = JSON.parse(scripts[0].innerHTML) as { '@type': string }
    expect(jsonLd['@type']).toBe('BlogPosting')
  })

  it('renders a feedback link to the Google Form', async () => {
    const post = UPDATE_POSTS[0]
    const element = await UpdatePostPage({ params: Promise.resolve({ slug: post.slug }) })
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
})
