'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { trackStartFocusingClick } from '@/lib/ga'
import posthog from 'posthog-js'

type Props = {
  // Pages with no dark hero image behind the nav (e.g. /updates) — the
  // white-on-transparent "unscrolled" look is illegible without one, so
  // always render the scrolled (dark-on-light) styling.
  overLightBackground?: boolean
}

export default function Nav({ overLightBackground = false }: Props = {}) {
  const [scrolledState, setScrolledState] = useState(false)
  const scrolled = scrolledState || overLightBackground

  useEffect(() => {
    const handler = () => setScrolledState(window.scrollY > 80)
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
          src="/images/logo-wordmark.png"
          alt="NookTimer"
          width={87}
          height={17}
          priority
          style={{ filter: scrolled ? 'none' : 'brightness(0) invert(1)' }}
        />
        <div className="flex items-center gap-6">
          <Link
            href="/blog"
            className={`font-pretendard text-[14px] transition-colors ${
              scrolled ? 'text-[#343434] hover:text-[#343434]/70' : 'text-[#F6F6F3] hover:text-[#F6F6F3]/70'
            }`}
          >
            Blog
          </Link>
          <Link
            href="/updates"
            className={`font-pretendard text-[14px] transition-colors ${
              scrolled ? 'text-[#343434] hover:text-[#343434]/70' : 'text-[#F6F6F3] hover:text-[#F6F6F3]/70'
            }`}
          >
            Updates
          </Link>
          <Link
            href="/"
            onClick={() => {
              trackStartFocusingClick({ button_location: 'nav' })
              posthog.capture('start_focusing_click', { button_location: 'nav' })
            }}
            className="bg-[#343434] text-[#F6F6F3] font-dm font-bold text-[14px] tracking-[-0.35px] leading-[1.4] px-[22px] py-[14px] rounded-full whitespace-nowrap transition-opacity hover:opacity-80"
          >
            Start focusing
          </Link>
        </div>
      </div>
    </header>
  )
}
