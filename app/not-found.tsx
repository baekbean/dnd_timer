'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { trackNotFound } from '@/lib/ga'

export default function NotFound() {
  useEffect(() => {
    trackNotFound({
      attempted_path: window.location.pathname + window.location.search,
      referrer: document.referrer || '(none)',
    })
  }, [])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#F6F6F3] px-6 text-center">
      <p className="font-pretendard text-[15px] text-[#343434]/60">404</p>
      <h1 className="font-aspekta text-[22px] uppercase text-[#343434]">Page not found</h1>
      <p className="max-w-[360px] font-pretendard text-[15px] leading-relaxed text-[#343434]/70">
        This link doesn&apos;t lead anywhere — the page may have moved or the URL was mistyped.
      </p>
      <Link
        href="/timer"
        className="mt-2 rounded-full bg-[#343434] px-6 py-3 font-pretendard text-[14px] text-[#F6F6F3] transition-opacity hover:opacity-80"
      >
        Go to the timer
      </Link>
      <Link
        href="/"
        className="font-pretendard text-[13px] text-[#343434]/55 underline underline-offset-4 transition-colors hover:text-[#343434]"
      >
        Back to home
      </Link>
    </main>
  )
}
