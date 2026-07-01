'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'
import { buildFormUrl } from '@/lib/constants'

const TOTAL_SECONDS = 25 * 60

const BG_SLIDES = [
  { type: 'image' as const, src: '/images/timer-bg.png' },
  { type: 'color' as const, color: '#8A9E8A' },
  { type: 'color' as const, color: '#7B8FA1' },
  { type: 'color' as const, color: '#A69B8A' },
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${pad(m)}:${pad(s)}`
}

function BgLayer({
  bg,
  opacity,
  transition,
}: {
  bg: (typeof BG_SLIDES)[number]
  opacity: number
  transition?: boolean
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        transition: transition ? 'opacity 0.7s ease-in-out' : undefined,
      }}
    >
      {bg.type === 'image' ? (
        <Image src={bg.src} alt="" fill className="object-cover" sizes="880px" />
      ) : (
        <div className="absolute inset-0" style={{ background: bg.color }} />
      )}
    </div>
  )
}

function PauseIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
      <rect x="1" y="1" width="5" height="16" rx="2" fill="#f6f6f3" />
      <rect x="10" y="1" width="5" height="16" rx="2" fill="#f6f6f3" />
    </svg>
  )
}

function SkipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 1L8 6L1 11V1Z" fill="#f6f6f3" />
      <rect x="9" y="1" width="2" height="10" rx="1" fill="#f6f6f3" />
    </svg>
  )
}

function HeroTimerCard() {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS)
  const [slideIndex, setSlideIndex] = useState(0)
  const [nextSlideIndex, setNextSlideIndex] = useState(1)
  const [fading, setFading] = useState(false)

  // Countdown
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? TOTAL_SECONDS : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Background rolling every 8s with crossfade
  useEffect(() => {
    const id = setInterval(() => {
      const next = (slideIndex + 1) % BG_SLIDES.length
      setNextSlideIndex(next)
      setFading(true)
      setTimeout(() => {
        setSlideIndex(next)
        setFading(false)
      }, 700)
    }, 8000)
    return () => clearInterval(id)
  }, [slideIndex])

  return (
    // Outer wrapper — same aspect ratio as original hero-timer.png (928×649)
    <div className="relative w-full" style={{ aspectRatio: '928 / 649' }}>
      {/* Monitor frame — on top (z-10) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Image
          src="/images/monitor-img.svg"
          alt="Monitor"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Timer screen — behind monitor frame (z-0) */}
      {/* Bezel inset percentages derived from Figma: 24px inset on 928px wide, 24px top on 637px tall, 495px screen height */}
      <div
        className="absolute z-0 overflow-hidden rounded-[1%]"
        style={{
          left: '2.586%',
          right: '2.586%',
          top: '3.767%',
          height: '77.71%',
        }}
      >
        {/* Background layers with crossfade */}
        <BgLayer bg={BG_SLIDES[slideIndex]} opacity={1} />
        <BgLayer bg={BG_SLIDES[nextSlideIndex]} opacity={fading ? 1 : 0} transition />

        {/* Green tint overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(116,133,110,0.3)' }}
        />

        {/* Sound button — top left */}
        <div
          className="absolute flex items-center gap-[6px] rounded-[3.7px] px-3 py-2"
          style={{
            left: '3.1%',
            top: '5.6%',
            background: 'rgba(44,44,44,0.4)',
            border: '0.458px solid rgba(44,44,44,0.2)',
          }}
        >
          <Image src="/images/speaker-icon.svg" alt="" width={11} height={9} />
          <span
            className="text-[11px] leading-none text-[#f5f5f5] whitespace-nowrap"
          >
            Sound
          </span>
        </div>

        {/* Timer card — center */}
        <div
          className="absolute flex flex-col items-center gap-6"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(calc(-50% + 1.26%), calc(-50% + 1.5%))',
          }}
        >
          {/* Session label */}
          <p className="text-[13.75px] leading-none text-[#f5f5f5] whitespace-nowrap">
            Focus / Session 1
          </p>

          {/* Timer digits */}
          <div className="py-3">
            <span
              className="leading-none text-[#f6f6f3] lowercase"
              style={{
                fontFamily: "'DIN Condensed', sans-serif",
                fontWeight: 700,
                fontSize: '110px',
                letterSpacing: '-0.02em',
              }}
            >
              {formatTime(remaining)}
            </span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-6">
            {/* Refresh */}
            <button
              type="button"
              aria-label="Reset"
              className="flex items-center justify-center rounded-full"
              style={{
                width: 22.9,
                height: 22.9,
                background: 'rgba(246,246,243,0.4)',
              }}
            >
              <Image src="/images/refresh-icon.svg" alt="" width={13} height={13} />
            </button>

            {/* Pause */}
            <button
              type="button"
              aria-label="Pause"
              className="flex items-center justify-center rounded-full"
              style={{
                width: 45.8,
                height: 45.8,
                background: 'rgba(246,246,243,0.4)',
              }}
            >
              <PauseIcon />
            </button>

            {/* Skip */}
            <button
              type="button"
              aria-label="Skip"
              className="flex items-center justify-center rounded-full"
              style={{
                width: 22.9,
                height: 22.9,
                background: 'rgba(246,246,243,0.4)',
              }}
            >
              <SkipIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    track('join_waitlist', { location: 'hero', email })
    const url = buildFormUrl(email)
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#F6F6F3]">
      {/* Background image fading out at bottom */}
      <div
        className="absolute top-0 left-0 w-full h-[642px] pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        }}
      >
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-[928px] pt-[120px] pb-[200px] flex flex-col items-center gap-[60px]">
        {/* Timer card — replaces static hero-timer.png */}
        <div className="w-full relative px-4 md:px-0">
          <HeroTimerCard />
        </div>

        {/* Email signup */}
        <div className="flex flex-col items-center gap-[40px] w-full px-4 md:px-0">
          <div className="flex flex-col gap-4 items-center text-center">
            <h1 className="font-aspekta uppercase text-[28px] md:text-[40px] leading-[1.3] text-[#343434]">
              A focus timer that <br />
              belongs on your desk.
            </h1>
            <p className="font-pretendard text-[16px] md:text-[24px] text-[#343434] tracking-[-0.12px] leading-[1.4]">
              A focus timer designed to become part of your workspace.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-4 bg-white pl-6 pr-2 py-2 rounded-full shadow-[0px_0px_4px_rgba(0,0,0,0.1),0px_0px_2px_rgba(0,0,0,0.05)] w-full max-w-[572px]"
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
              className="bg-[#343434] text-[#F6F6F3] font-dm font-bold text-[14px] tracking-[-0.35px] leading-[1.4] px-[22px] py-[14px] rounded-full whitespace-nowrap w-[200px] transition-opacity hover:opacity-80"
            >
              Join waitlist
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
