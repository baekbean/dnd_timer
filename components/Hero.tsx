'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { trackStartFocusingClick } from '@/lib/ga'
import SectionTracker from '@/components/SectionTracker'
import posthog from 'posthog-js'

const TOTAL_SECONDS = 25 * 60

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${pad(m)}:${pad(s)}`
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

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? TOTAL_SECONDS : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
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
      <div
        className="absolute z-0 overflow-hidden rounded-[1%]"
        style={{
          left: '2.586%',
          right: '2.586%',
          top: '3.767%',
          height: '77.71%',
        }}
      >
        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/images/timer-bg.webm" type="video/webm" />
          <source src="/images/timer-bg.mp4" type="video/mp4" />
        </video>

        {/* Color overlay #74856E 30% */}
        <div className="absolute inset-0" style={{ background: 'rgba(116, 133, 110, 0.3)' }} />

        {/* Sound button — top left */}
        <div
          className="absolute flex items-center gap-[6px] rounded-[3.7px] px-2 py-1"
          style={{
            left: '3.1%',
            top: '5.6%',
            background: 'rgba(44,44,44,0.4)',
            border: '0.458px solid rgba(44,44,44,0.2)',
          }}
        >
          <Image src="/images/speaker-icon.svg" alt="" width={11} height={9} />
          <span
            className="leading-none text-[#f5f5f5] whitespace-nowrap"
            style={{ fontSize: 'clamp(7px, 1.2vw, 11px)' }}
          >
            Sound
          </span>
        </div>

        {/* Timer — centered, 16px top/bottom padding */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center py-4"
          style={{ gap: 'clamp(6px, 2.5vw, 24px)' }}
        >
          <p
            className="leading-none text-[#f5f5f5] whitespace-nowrap"
            style={{ fontSize: 'clamp(7px, 1.5vw, 13.75px)' }}
          >
            Focus / Session 1
          </p>

          {/* DIN Condensed has no tabular figures, so the colon is the layout anchor:
              minutes grow leftward, seconds grow rightward, colon never moves */}
          <span
            className="relative leading-none text-[#f6f6f3] lowercase"
            style={{
              fontFamily: "'DIN Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(36px, 11.8vw, 110px)',
              letterSpacing: '-0.02em',
            }}
          >
            :
            <span className="absolute right-full top-0 whitespace-nowrap">
              {formatTime(remaining).split(':')[0]}
            </span>
            <span className="absolute left-full top-0 whitespace-nowrap">
              {formatTime(remaining).split(':')[1]}
            </span>
          </span>

          <div
            className="flex items-center justify-center"
            style={{ gap: 'clamp(10px, 2.5vw, 24px)' }}
          >
            <button
              type="button"
              aria-label="Reset"
              className="flex items-center justify-center rounded-full"
              style={{
                width: 'clamp(16px, 2.47vw, 22.9px)',
                height: 'clamp(16px, 2.47vw, 22.9px)',
                background: 'rgba(246,246,243,0.4)',
              }}
            >
              <Image src="/images/refresh-icon.svg" alt="" width={13} height={13} />
            </button>
            <button
              type="button"
              aria-label="Pause"
              className="flex items-center justify-center rounded-full"
              style={{
                width: 'clamp(32px, 4.94vw, 45.8px)',
                height: 'clamp(32px, 4.94vw, 45.8px)',
                background: 'rgba(246,246,243,0.4)',
              }}
            >
              <PauseIcon />
            </button>
            <button
              type="button"
              aria-label="Skip"
              className="flex items-center justify-center rounded-full"
              style={{
                width: 'clamp(16px, 2.47vw, 22.9px)',
                height: 'clamp(16px, 2.47vw, 22.9px)',
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
  return (
    <section className="relative w-full overflow-hidden bg-[#F6F6F3]">
      <SectionTracker sectionName="hero" />
      {/* Background image — no gradient, clipped at 442px (Figma spec) */}
      <div className="absolute top-0 left-0 w-full h-[442px] pointer-events-none overflow-hidden">
        <Image
          src="/images/hero-bg.png"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-[928px] pt-[120px] pb-[200px] flex flex-col items-center gap-[60px]">
        {/* Timer card */}
        <div className="w-full px-4 md:px-0">
          <HeroTimerCard />
        </div>

        {/* Product CTA */}
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

          <Link
            href="/"
            onClick={() => {
              trackStartFocusingClick({ button_location: 'about_hero' })
              posthog.capture('start_focusing_click', { button_location: 'about_hero' })
            }}
            className="bg-[#343434] text-[#F6F6F3] font-dm font-bold text-[14px] tracking-[-0.35px] leading-[1.4] px-[28px] py-[14px] rounded-full whitespace-nowrap transition-opacity hover:opacity-80"
          >
            Start focusing
          </Link>
        </div>
      </div>
    </section>
  )
}
