'use client'

import Link from 'next/link'
import { trackStartFocusingClick } from '@/lib/ga'
import posthog from 'posthog-js'

type Props = {
  icon: string
  label: string
  steps: string[]
  ctaText: string
  ctaHref: string
}

export default function BlogCallout({ icon, label, steps, ctaText, ctaHref }: Props) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-[#343434]/10 bg-[#F6F7E9] p-7">
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="text-[16px] leading-none">
          {icon}
        </span>
        <p className="font-pretendard text-[16px] font-semibold text-[#343434]">{label}</p>
      </div>
      <ol className="flex list-decimal flex-col gap-2 pl-5 font-pretendard text-[16px] leading-[1.7] text-[#343434]/85">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <Link
        href={ctaHref}
        onClick={() => {
          trackStartFocusingClick({ button_location: 'blog_post_callout' })
          posthog.capture('start_focusing_click', { button_location: 'blog_post_callout' })
        }}
        className="font-pretendard text-[14px] font-semibold text-[#343434] underline hover:opacity-70 transition-opacity w-fit"
      >
        {ctaText}
      </Link>
    </div>
  )
}
