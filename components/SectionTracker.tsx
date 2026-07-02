'use client'

import { useEffect, useRef } from 'react'
import { trackSectionView, type SectionName } from '@/lib/ga'

export default function SectionTracker({ sectionName }: { sectionName: SectionName }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackSectionView(sectionName)
          observer.disconnect() // 한 세션에 한 번만 발송
        }
      },
      { threshold: 0, rootMargin: '0px 0px -15% 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [sectionName])

  // 레이아웃에 영향 없는 1px 투명 div
  return <div ref={ref} aria-hidden className="h-px opacity-0 pointer-events-none select-none" />
}
