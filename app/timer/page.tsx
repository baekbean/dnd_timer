import type { Metadata } from 'next'
import TimerApp from '@/components/timer/TimerApp'

export const metadata: Metadata = {
  title: 'Timer — Do Not Disturb Timer',
  // Unreleased product surface — keep out of search until launch
  robots: { index: false, follow: false },
}

export default function TimerPage() {
  return <TimerApp />
}
