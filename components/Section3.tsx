'use client'

import Link from 'next/link'
import { trackStartFocusingClick } from '@/lib/ga'
import SectionTracker from '@/components/SectionTracker'
import posthog from 'posthog-js'

export default function Section3() {
  return (
    <section className="w-full flex flex-col gap-[40px] items-center pb-[200px] px-4 md:px-0">
      <SectionTracker sectionName="cta" />
      {/* Title */}
      <div className="flex flex-col gap-4 items-center text-center text-[#343434]">
        <h2 className="font-aspekta uppercase text-[28px] md:text-[40px] leading-[1.3]">
          Ready for do not disturb?<br />
          Make this session yours
        </h2>
        <p className="font-pretendard text-[16px] tracking-[-0.08px] leading-[1.4] w-full md:w-[448px]">
          Choose a calming scene or paste a YouTube video, then start focusing right away.
        </p>
      </div>

      <Link
        href="/"
        onClick={() => {
          trackStartFocusingClick({ button_location: 'about_cta' })
          posthog.capture('start_focusing_click', { button_location: 'about_cta' })
        }}
        className="bg-[#090908] text-[#F6F6F3] font-dm font-bold text-[14px] tracking-[-0.35px] leading-[1.4] px-[28px] py-[14px] rounded-full whitespace-nowrap transition-opacity hover:opacity-80"
      >
        Start focusing
      </Link>
    </section>
  )
}
