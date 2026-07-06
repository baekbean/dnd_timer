'use client'

import Image from 'next/image'
import { useState } from 'react'
import { track } from '@vercel/analytics'
import { buildFormUrl, submitEmailSilently } from '@/lib/constants'
import { trackWaitlistClick } from '@/lib/ga'
import SectionTracker from '@/components/SectionTracker'

export default function Section3() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    track('join_waitlist', { location: 'cta', email })
    trackWaitlistClick({ button_location: 'cta', button_text: 'Join Waitlist' })
    submitEmailSilently(email)
    const url = buildFormUrl(email)
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section className="w-full flex flex-col gap-[40px] items-center pb-[200px] px-4 md:px-0">
      <SectionTracker sectionName="cta" />
      {/* Title */}
      <div className="flex flex-col gap-4 items-center text-center text-[#343434]">
        <h2 className="font-aspekta uppercase text-[28px] md:text-[40px] leading-[1.3]">
          Ready for do not disturb?<br />
          Be the first to try
        </h2>
        <p className="font-pretendard text-[16px] tracking-[-0.08px] leading-[1.4] w-full md:w-[448px]">
          Join the waitlist and get early access to the first version.
        </p>
      </div>

      {/* Email form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-4 bg-[rgba(211,211,211,0.4)] pl-6 pr-2 py-2 rounded-full w-full max-w-[400px]"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 min-w-0 font-pretendard text-[16px] text-[#343434] tracking-[-0.08px] leading-[1.4] bg-transparent outline-none placeholder:text-[#343434]/40"
        />
        <button
          type="submit"
          className="bg-[#090908] text-[#F6F6F3] font-dm font-bold text-[14px] tracking-[-0.35px] leading-[1.4] px-[22px] py-[14px] rounded-full whitespace-nowrap transition-opacity hover:opacity-80"
        >
          Join Waitlist
        </button>
      </form>
    </section>
  )
}
