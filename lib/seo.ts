export const SITE_URL = 'https://nooktimer.com'
export const SITE_NAME = 'NookTimer'
export const SITE_TITLE = 'NookTimer – Focus Timer for Your Space'
export const SITE_DESCRIPTION =
  'An online focus timer that fits naturally into your workspace. Stay focused with calming scenes, ambient sounds, and a distraction-free experience.'

export interface FaqItem {
  question: string
  answer: string
}

// Single source for the visible FAQ section and the FAQPage JSON-LD.
// Google drops FAQ rich results when markup and on-page text diverge.
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is NookTimer free to use?',
    answer:
      'Yes. NookTimer is a free online focus timer that runs in your browser. There is nothing to download or install, and you do not need an account to start a session.',
  },
  {
    question: 'What is the Pomodoro Technique?',
    answer:
      'The Pomodoro Technique is a time management method where you work in focused sessions (traditionally 25 minutes) separated by short breaks. NookTimer lets you customize session and break lengths to match the rhythm that works for you.',
  },
  {
    question: 'Can I use NookTimer as a study timer?',
    answer:
      'Absolutely. Many people use NookTimer for study-with-me style sessions. Pick a calming scene, turn on ambient sound like rain or birdsong, and set a session cycle that matches your study plan.',
  },
  {
    question: 'Can I change the scenes and sounds?',
    answer:
      'Yes. NookTimer ships with a set of calming scenes — like Meadow, Dusk, and Night — each with matching ambient audio, and you can even bring your own YouTube video as a custom scene.',
  },
  {
    question: 'Does the timer keep running in the background?',
    answer:
      'Yes. The countdown continues while the tab is in the background, and the remaining time is shown in the tab title so you can glance at it from any other tab.',
  },
]

export function webApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'Productivity',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern web browser with JavaScript enabled.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

// Escapes `<` so the payload cannot close the script tag (XSS hardening
// recommended by the Next.js JSON-LD guide).
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
