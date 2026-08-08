export const SITE_URL = 'https://nooktimer.com'
export const SITE_NAME = 'NookTimer'
export const SITE_TITLE = 'NookTimer – Focus Timer for Your Space'
// Single source for every description surface: root metadata (description, OG,
// Twitter), the WebApplication JSON-LD, and public/manifest.json (hand-synced —
// static JSON cannot import). Kept under ~155 chars so Google does not truncate
// it in the SERP. Leads with the category, then the differentiator competitors
// cannot claim: no account and no gamification of any kind.
export const SITE_DESCRIPTION =
  'A free online focus timer with calming scenes and ambient sounds. No account, no streaks — just a quiet corner and a countdown that follows you tab to tab.'

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
      'Absolutely. Many people use NookTimer for study-with-me style sessions. Pick a calming scene, turn on the ambient sound layer, and set a session cycle that matches your study plan.',
  },
  {
    question: 'Can I change the scenes and sounds?',
    answer:
      'Yes. NookTimer ships with a set of calming scenes — like Meadow, Dusk, and Night — plus an ambient sound layer you can toggle to match the mood. More scenes and sounds are on the way.',
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
    // Must be a schema.org enumeration value — bare 'Productivity' is not one.
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern web browser with JavaScript enabled.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}

export function faqPageJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function faqJsonLd() {
  return faqPageJsonLd(FAQ_ITEMS)
}

interface BlogPostingLike {
  slug: string
  title: string
  date: string
  excerpt: string
}

export function blogPostingJsonLd(post: BlogPostingLike, basePath: '/updates' | '/blog') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    description: post.excerpt,
    url: `${SITE_URL}${basePath}/${post.slug}`,
    author: { '@type': 'Organization', name: SITE_NAME },
  }
}

// Escapes `<` so the payload cannot close the script tag (XSS hardening
// recommended by the Next.js JSON-LD guide). Contract: pass build-time
// constants only — this escape is NOT sufficient for user- or CMS-derived
// content, and JSON.stringify throws on circular input.
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
