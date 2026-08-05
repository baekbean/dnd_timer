import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BlogFeedbackLink from '@/components/blog/BlogFeedbackLink'
import BlogPostBody from '@/components/blog/BlogPostBody'
import BlogReadNext from '@/components/blog/BlogReadNext'
import { blogPostingJsonLd, faqPageJsonLd, serializeJsonLd, SITE_URL } from '@/lib/seo'
import { BLOG_POSTS, getBlogPost } from '@/lib/blog'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      // Metadata merging is shallow — a page-level openGraph replaces the
      // layout's object entirely, so siteName/type must be repeated here.
      siteName: 'NookTimer',
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const faqBlock = post.blocks.find((block) => block.type === 'faq')

  return (
    <section className="relative w-full px-4 md:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogPostingJsonLd(post, '/blog')) }}
      />
      {faqBlock && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqPageJsonLd(faqBlock.items)) }}
        />
      )}
      <div className="mx-auto max-w-[720px] pt-[160px] pb-[160px] flex flex-col gap-8">
        <Link
          href="/blog"
          className="font-pretendard text-[14px] underline hover:opacity-70 transition-opacity w-fit"
        >
          ← Blog
        </Link>

        <div className="flex flex-col gap-2">
          <p className="font-mono text-[12px] text-[#343434]/55 tracking-[-0.12px]">
            {post.date} · {post.tag} · {post.readTime}
          </p>
          <h1 className="font-aspekta uppercase text-[28px] md:text-[36px] leading-[1.3] text-[#343434]">
            {post.title}
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          {post.lede.map((paragraph, i) => (
            <p key={i} className="font-pretendard text-[16px] leading-[1.7] text-[#343434]/85">
              {paragraph}
            </p>
          ))}
        </div>

        <BlogPostBody blocks={post.blocks} />

        <BlogReadNext currentSlug={post.slug} />

        <p className="font-pretendard text-[14px] text-[#343434]/70">
          Questions or feedback on this post? <BlogFeedbackLink />.
        </p>

        <Link
          href="/blog"
          className="font-pretendard text-[14px] underline hover:opacity-70 transition-opacity w-fit"
        >
          ← Back to Blog
        </Link>
      </div>
    </section>
  )
}
