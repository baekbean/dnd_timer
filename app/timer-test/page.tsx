import type { Metadata } from 'next'
import TimerAppFeather from '@/components/timer-test/TimerAppFeather'

export const metadata: Metadata = {
  title: 'Timer (concept) — Do Not Disturb Timer',
  // Experimental design variant — keep out of search
  robots: { index: false, follow: false },
}

export default function TimerTestPage() {
  return <TimerAppFeather />
}
