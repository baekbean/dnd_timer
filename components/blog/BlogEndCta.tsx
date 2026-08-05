'use client'

import Link from 'next/link'
import { trackStartFocusingClick } from '@/lib/ga'
import posthog from 'posthog-js'

type Props = {
  heading: string
  buttonText: string
  buttonHref: string
}

export default function BlogEndCta({ heading, buttonText, buttonHref }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-br from-[#74856E] to-[#5C6B57] px-8 py-14 text-center">
      <p className="font-aspekta uppercase text-[22px] leading-[1.3] text-[#F6F6F3] max-w-[480px]">
        {heading}
      </p>
      <Link
        href={buttonHref}
        onClick={() => {
          trackStartFocusingClick({ button_location: 'blog_post_end_cta' })
          posthog.capture('start_focusing_click', { button_location: 'blog_post_end_cta' })
        }}
        className="bg-[#343434] text-[#F6F6F3] font-dm font-bold text-[14px] tracking-[-0.35px] leading-[1.4] px-[22px] py-[14px] rounded-full whitespace-nowrap transition-opacity hover:opacity-80"
      >
        {buttonText}
      </Link>
    </div>
  )
}
