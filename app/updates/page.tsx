import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import { sortedUpdatePosts } from '@/lib/updates'

export const metadata: Metadata = {
  title: 'Updates',
  description: 'Casual, behind-the-scenes updates on what we’re building for NookTimer.',
  alternates: {
    canonical: '/updates',
  },
  openGraph: {
    title: 'Updates | NookTimer',
    description: 'Casual, behind-the-scenes updates on what we’re building for NookTimer.',
    url: `${SITE_URL}/updates`,
    // Metadata merging is shallow — a page-level openGraph replaces the
    // layout's object entirely, so siteName/type must be repeated here.
    siteName: 'NookTimer',
    type: 'website',
  },
}

export default function UpdatesPage() {
  const posts = sortedUpdatePosts()

  return (
    <section className="relative w-full px-4 md:px-0">
      <div className="mx-auto max-w-[720px] pt-[80px] pb-[160px] flex flex-col gap-16">
        <h1 className="font-aspekta uppercase text-[28px] md:text-[40px] leading-[1.3] text-[#343434]">
          Updates
        </h1>

        <div className="flex flex-col gap-12">
          {posts.map((post) => (
            <article key={post.slug} className="flex flex-col gap-2">
              <p className="font-mono text-[12px] text-[#343434]/55 tracking-[-0.12px]">
                {post.date}
              </p>
              <h2 className="font-aspekta uppercase text-[20px] leading-[1.4] text-[#343434]">
                <Link href={`/updates/${post.slug}`} className="hover:opacity-70 transition-opacity">
                  {post.title}
                </Link>
              </h2>
              <p className="font-pretendard text-[16px] leading-[1.7] text-[#343434]/80">
                {post.excerpt}
              </p>
              <Link
                href={`/updates/${post.slug}`}
                className="font-pretendard text-[14px] underline hover:opacity-70 transition-opacity w-fit"
              >
                Read more
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
