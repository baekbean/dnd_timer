import type { Metadata } from 'next'
import TimerAppYoutube from '@/components/timer-test2/TimerAppYoutube'

export const metadata: Metadata = {
  title: 'Timer YouTube Test — Do Not Disturb Timer',
  robots: { index: false, follow: false },
}

export default function TimerTest2Page() {
  return <TimerAppYoutube />
}
