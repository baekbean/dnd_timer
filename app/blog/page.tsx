import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import { sortedBlogPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Practical guides on focus, breaks, and building a routine that sticks — from the team behind NookTimer.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog | NookTimer',
    description:
      'Practical guides on focus, breaks, and building a routine that sticks — from the team behind NookTimer.',
    url: `${SITE_URL}/blog`,
    // Metadata merging is shallow — a page-level openGraph replaces the
    // layout's object entirely, so siteName/type must be repeated here.
    siteName: 'NookTimer',
    type: 'website',
  },
}

export default function BlogPage() {
  const posts = sortedBlogPosts()

  return (
    <section className="relative w-full px-4 md:px-0">
      <div className="mx-auto max-w-[720px] pt-[160px] pb-[160px] flex flex-col gap-16">
        <h1 className="font-aspekta uppercase text-[28px] md:text-[40px] leading-[1.3] text-[#343434]">
          Blog
        </h1>

        <div className="flex flex-col gap-12">
          {posts.map((post) => (
            <article key={post.slug} className="flex flex-col gap-2">
              <p className="font-mono text-[12px] text-[#343434]/55 tracking-[-0.12px]">
                {post.date} · {post.tag} · {post.readTime}
              </p>
              <h2 className="font-aspekta uppercase text-[20px] leading-[1.4] text-[#343434]">
                <Link href={`/blog/${post.slug}`} className="hover:opacity-70 transition-opacity">
                  {post.title}
                </Link>
              </h2>
              <p className="font-pretendard text-[16px] leading-[1.7] text-[#343434]/80">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
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
