'use client'

import Image from 'next/image'
import { useState } from 'react'
import { track } from '@vercel/analytics'
import { buildFormUrl } from '@/lib/constants'

export default function Section3() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    track('join_waitlist', { location: 'cta', email })
    const url = buildFormUrl(email)
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section className="w-full flex flex-col gap-[40px] items-center pb-[200px] px-4 md:px-0">
      {/* Title */}
      <div className="flex flex-col gap-4 items-center text-center text-[#343434]">
        <h2 className="font-aspekta uppercase text-[28px] md:text-[40px] leading-[1.3]">
          Ready to Do not disturb?<br />
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

      {/* macOS-style Do Not Disturb notification mockup */}
      <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.4)] px-5 py-5 rounded-full">
        <div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
          <Image src="/images/icon-moon.svg" alt="" width={32} height={32} />
        </div>
        <div className="flex flex-col items-center">
          <p className="font-inter font-bold text-[24px] text-black tracking-[-0.5px] whitespace-nowrap leading-tight">
            Do Not Disturb
          </p>
          <p className="font-inter text-[20px] text-[#7d5ec0] leading-tight">on</p>
        </div>
        <div className="w-[72px] h-[72px] flex items-center justify-center flex-shrink-0">
          <Image src="/images/icon-dots.svg" alt="" width={43} height={43} />
        </div>
      </div>
    </section>
  )
}
