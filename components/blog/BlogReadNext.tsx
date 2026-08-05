import Link from 'next/link'
import { sortedBlogPosts } from '@/lib/blog'

type Props = {
  currentSlug: string
}

export default function BlogReadNext({ currentSlug }: Props) {
  const otherPosts = sortedBlogPosts().filter((post) => post.slug !== currentSlug)
  if (otherPosts.length === 0) return null

  return (
    <div className="flex flex-col gap-4 border-t border-[#343434]/10 pt-8">
      <h2 className="font-aspekta uppercase text-[18px] leading-[1.4] text-[#343434]">
        Read next
      </h2>
      <div className="flex flex-col gap-3">
        {otherPosts.map((post) => (
          <article key={post.slug} className="flex flex-col gap-1">
            <p className="font-mono text-[12px] text-[#343434]/55 tracking-[-0.12px]">
              {post.date}
            </p>
            <Link
              href={`/blog/${post.slug}`}
              className="font-aspekta uppercase text-[16px] leading-[1.4] text-[#343434] hover:opacity-70 transition-opacity w-fit"
            >
              {post.title}
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
