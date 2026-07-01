'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'
import { GOOGLE_FORM_BASE_URL } from '@/lib/constants'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-[#F6F6F3]' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1280px] flex items-center justify-between px-4 md:px-10 py-5">
        <Image
          src="/images/logo-dark.png"
          alt="Do not Disturb Timer"
          width={169}
          height={17}
          priority
          style={{ filter: scrolled ? 'none' : 'brightness(0) invert(1)' }}
        />
        <a
          href={GOOGLE_FORM_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('join_waitlist', { location: 'nav' })}
          className="bg-[#343434] text-[#F6F6F3] font-dm font-bold text-[14px] tracking-[-0.35px] leading-[1.4] px-[22px] py-[14px] rounded-full whitespace-nowrap transition-opacity hover:opacity-80"
        >
          Join waitlist
        </a>
      </div>
    </header>
  )
}
