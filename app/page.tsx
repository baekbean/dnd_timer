import type { Metadata } from 'next'
import TimerApp from '@/components/timer/TimerApp'

export const metadata: Metadata = {
  title: 'Do Not Disturb Timer',
}

export default function Home() {
  return <TimerApp />
}
