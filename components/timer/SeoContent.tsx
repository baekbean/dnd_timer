import Link from 'next/link'
import { FAQ_ITEMS } from '@/lib/seo'

const FEATURES = [
  {
    title: 'Scenes that feel like your space',
    body: 'Choose a calming scene — a sunlit meadow, a quiet dusk, a still night — and let the timer fade into the background of your workspace instead of shouting for attention.',
  },
  {
    title: 'Ambient sound that keeps you in flow',
    body: 'Flip on the ambient sound layer and let steady background noise mask distractions — it makes long focus sessions feel effortless.',
  },
  {
    title: 'Pomodoro-style sessions, your way',
    body: 'Run classic 25/5 Pomodoro cycles or set your own focus and break lengths. NookTimer tracks your sessions through each cycle so you always know where you are.',
  },
]

const STEPS = [
  'Pick a scene and ambient sound that fit your mood.',
  'Set your focus length, break length, and how many sessions you want to run.',
  'Press start and settle in — the countdown stays visible in the tab title even while you work elsewhere.',
]

export default function SeoContent() {
  return (
    <section className="bg-[#141414] px-6 py-20 text-[#d9d9d4]">
      <div className="mx-auto flex max-w-[720px] flex-col gap-16">
        <header className="flex flex-col gap-4">
          <h1 className="font-aspekta text-[26px] uppercase leading-[1.3] text-[#f5f5f5] md:text-[32px]">
            A calm online focus timer for deep work and study
          </h1>
          <p className="text-[16px] leading-[1.7]">
            NookTimer is a free focus timer that runs right in your browser — no
            download, no account. Instead of a bare countdown, it gives you a
            quiet corner: calming scenes, ambient sounds, and a Pomodoro-style
            session flow designed to help you stay with your work, whether
            that&apos;s deep work, studying, reading, or writing.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="flex flex-col gap-2">
              <h2 className="font-aspekta text-[18px] uppercase leading-[1.4] text-[#f5f5f5]">
                {feature.title}
              </h2>
              <p className="text-[16px] leading-[1.7]">{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-aspekta text-[18px] uppercase leading-[1.4] text-[#f5f5f5]">
            How to use NookTimer
          </h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-[16px] leading-[1.7]">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="font-aspekta text-[18px] uppercase leading-[1.4] text-[#f5f5f5]">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-6">
            {FAQ_ITEMS.map((item) => (
              <article key={item.question} className="flex flex-col gap-2">
                <h3 className="text-[16px] font-semibold leading-[1.5] text-[#f5f5f5]">
                  {item.question}
                </h3>
                <p className="text-[16px] leading-[1.7]">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>

        <footer className="border-t border-[#2c2c2c] pt-8 text-[13px] leading-[1.6] text-[#8a8a85]">
          <p>
            Curious where NookTimer is headed?{' '}
            <Link href="/about" className="underline hover:text-[#d9d9d4]">
              Learn more about the project
            </Link>
            .
          </p>
        </footer>
      </div>
    </section>
  )
}
