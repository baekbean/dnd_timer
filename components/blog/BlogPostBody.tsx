import type { BlogBlock } from '@/lib/blog'
import BlogCallout from './BlogCallout'
import BlogEndCta from './BlogEndCta'

type Props = {
  blocks: BlogBlock[]
}

export default function BlogPostBody({ blocks }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p
                key={i}
                className="font-pretendard text-[16px] leading-[1.7] text-[#343434]/85"
              >
                {block.text}
              </p>
            )
          case 'heading':
            return block.level === 'h2' ? (
              <h2
                key={i}
                className="font-aspekta uppercase text-[22px] md:text-[24px] leading-[1.3] text-[#343434] mt-4"
              >
                {block.text}
              </h2>
            ) : (
              <h3
                key={i}
                className="font-pretendard text-[18px] font-semibold leading-[1.4] text-[#343434]"
              >
                {block.text}
              </h3>
            )
          case 'callout':
            return <BlogCallout key={i} {...block} />
          case 'faq':
            return (
              <div key={i} className="flex flex-col gap-6 mt-4">
                <h2 className="font-aspekta uppercase text-[22px] md:text-[24px] leading-[1.3] text-[#343434]">
                  FAQ
                </h2>
                <div className="flex flex-col gap-6">
                  {block.items.map((item) => (
                    <article key={item.question} className="flex flex-col gap-2">
                      <h3 className="font-pretendard text-[16px] font-semibold leading-[1.5] text-[#343434]">
                        {item.question}
                      </h3>
                      <p className="font-pretendard text-[16px] leading-[1.7] text-[#343434]/85">
                        {item.answer}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            )
          case 'cta':
            return <BlogEndCta key={i} {...block} />
          default: {
            const _exhaustive: never = block
            return _exhaustive
          }
        }
      })}
    </div>
  )
}
