import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import UpdatesFeedbackLink from '@/components/timer/UpdatesFeedbackLink'
import { blogPostingJsonLd, serializeJsonLd, SITE_URL } from '@/lib/seo'
import { getUpdatePost, UPDATE_POSTS } from '@/lib/updates'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return UPDATE_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getUpdatePost(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/updates/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/updates/${post.slug}`,
      // Metadata merging is shallow — a page-level openGraph replaces the
      // layout's object entirely, so siteName/type must be repeated here.
      siteName: 'NookTimer',
      type: 'article',
    },
  }
}

export default async function UpdatePostPage({ params }: Props) {
  const { slug } = await params
  const post = getUpdatePost(slug)
  if (!post) notFound()

  return (
    <section className="relative w-full px-4 md:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogPostingJsonLd(post)) }}
      />
      <div className="mx-auto max-w-[720px] pt-[80px] pb-[160px] flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[12px] text-[#343434]/55 tracking-[-0.12px]">
            {post.date}
          </p>
          <h1 className="font-aspekta uppercase text-[28px] md:text-[36px] leading-[1.3] text-[#343434]">
            {post.title}
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          {post.body.map((paragraph, i) => (
            <p key={i} className="font-pretendard text-[16px] leading-[1.7] text-[#343434]/85">
              {paragraph}
            </p>
          ))}
        </div>

        <p className="font-pretendard text-[14px] text-[#343434]/70">
          Questions or feedback on this update? <UpdatesFeedbackLink />.
        </p>

        <Link
          href="/updates"
          className="font-pretendard text-[14px] underline hover:opacity-70 transition-opacity w-fit"
        >
          ← Back to Updates
        </Link>
      </div>
    </section>
  )
}
