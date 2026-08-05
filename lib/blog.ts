import type { FaqItem } from './seo'

export type BlogBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 'h2' | 'h3'; text: string }
  | {
      type: 'callout'
      icon: string
      label: string
      steps: string[]
      ctaText: string
      ctaHref: string
    }
  | { type: 'faq'; items: FaqItem[] }
  | { type: 'cta'; heading: string; buttonText: string; buttonHref: string }

export interface BlogPost {
  slug: string
  title: string
  date: string // ISO date, e.g. '2026-08-05'
  tag: string
  readTime: string
  excerpt: string
  lede: string[] // intro paragraphs, rendered before the first block
  blocks: BlogBlock[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-use-the-pomodoro-technique',
    title: 'How to use the Pomodoro Technique',
    date: '2026-08-05',
    tag: 'Focus',
    readTime: '5 min read',
    excerpt:
      "Starting is the hardest part. Here's how to run 25/5 and 50/10 focus sessions — and adjust them — without turning your routine into another complicated system.",
    lede: [
      'Starting is often the hardest part of getting anything done.',
      'A task can feel too large, your attention can feel scattered, or you may simply not be in the mood to focus. The Pomodoro Technique makes beginning feel more manageable by asking you to focus for a limited period instead of finishing everything at once.',
      'Here’s how to try it without turning your focus routine into another complicated system.',
    ],
    blocks: [
      {
        type: 'callout',
        icon: '🍅',
        label: 'Pomodoro quick start',
        steps: [
          'Choose one specific task.',
          'Set a timer for 25 minutes.',
          'Focus on that task until the timer ends.',
          'Take a 5-minute break.',
          'Repeat four times, then take a longer 15–30 minute break.',
        ],
        ctaText: 'Start a 25-minute focus session →',
        ctaHref: '/',
      },
      { type: 'heading', level: 'h2', text: 'What is the Pomodoro Technique?' },
      {
        type: 'paragraph',
        text: 'The Pomodoro Technique is a time-management method that divides work into focused sessions and breaks. Instead of measuring progress only by whether you finish a task, you commit to working on it for one defined session.',
      },
      {
        type: 'paragraph',
        text: 'This structure can make breaks more deliberate and give an overwhelming task a clearer place to begin.',
      },
      {
        type: 'paragraph',
        text: 'Research has not shown that fixed Pomodoro breaks are consistently better than taking breaks based on your own fatigue and attention. Think of 25/5 as a useful starting point, then adjust it based on how you actually work.',
      },
      { type: 'heading', level: 'h2', text: 'Do you have to use 25/5?' },
      {
        type: 'paragraph',
        text: 'The traditional Pomodoro interval is 25 minutes of focus followed by a 5-minute break, but you do not have to treat it as a rigid rule.',
      },
      {
        type: 'paragraph',
        text: 'You might begin with 25/5 when a shorter commitment feels easier to approach. You may prefer 50 minutes of focus followed by a 10-minute break when shorter intervals interrupt your flow. If 25 minutes feels overwhelming, start with 10 or 15.',
      },
      {
        type: 'paragraph',
        text: 'These are options to test, not scientifically proven matches for particular types of work. Notice how each interval affects your attention, fatigue, and momentum. If you’re unsure, start with 25 minutes and adjust from there.',
      },
      { type: 'heading', level: 'h2', text: 'How to begin your first Pomodoro' },
      { type: 'heading', level: 'h3', text: '1. Pick one specific task' },
      {
        type: 'paragraph',
        text: '“Study” is broad. “Review chapter three” gives your attention somewhere to go. Choose something clear enough that you can begin without making another decision.',
      },
      { type: 'heading', level: 'h3', text: '2. Prepare your environment' },
      {
        type: 'paragraph',
        text: 'Close the tabs you don’t need. Put your phone out of reach. Keep the materials for your task nearby.',
      },
      {
        type: 'paragraph',
        text: 'Your digital environment is part of the setup too. A calm background or steady ambient sound may help some people settle in, but responses to background audio vary by person and task. If you use sound, choose something that does not repeatedly pull your attention away.',
      },
      { type: 'heading', level: 'h3', text: '3. Start the timer' },
      {
        type: 'paragraph',
        text: 'Once the timer begins, stay with your chosen task until the session ends. If you remember something unrelated, write it down and return to it later. You don’t have to follow every thought the moment it appears.',
      },
      { type: 'heading', level: 'h3', text: '4. Take a real break' },
      {
        type: 'paragraph',
        text: 'Stand up, stretch, refill your water, or look away from your screen.',
      },
      {
        type: 'paragraph',
        text: 'Planned breaks can support recovery, but their effects depend on the task, timing, and person. Treat the break as a chance to check what leaves you feeling ready for the next session.',
      },
      { type: 'heading', level: 'h3', text: '5. Adjust the routine' },
      { type: 'paragraph', text: 'The Pomodoro Technique is a framework, not a rule.' },
      {
        type: 'paragraph',
        text: 'If 25 minutes feels too short, try 50. If your concentration fades sooner, begin with 15. A useful routine is one you can return to and adapt based on your experience.',
      },
      { type: 'heading', level: 'h2', text: 'Make focusing easier to return to' },
      {
        type: 'paragraph',
        text: 'A timer can tell you when to work and when to rest. The environment around it can also make a focus routine feel easier to return to.',
      },
      {
        type: 'paragraph',
        text: 'NookTimer gives you a calm, ready-made focus space or lets you turn a favorite YouTube video into your background.',
      },
      {
        type: 'faq',
        items: [
          {
            question: 'How many Pomodoros should I do before a long break?',
            answer:
              'The traditional method uses four 25-minute focus sessions before a longer 15–30 minute break. Adjust this if you feel tired sooner or want to continue a productive flow.',
          },
          {
            question: 'What should I do during a Pomodoro break?',
            answer:
              'Step away from your task when possible. Stand up, stretch, refill your water, or rest your eyes instead of immediately opening another distracting screen.',
          },
          {
            question: 'What if 25 minutes is too long?',
            answer:
              'Start with 10 or 15 minutes. The goal is to make beginning easier, not to force yourself through an interval that does not work for you.',
          },
          {
            question: 'Can I use music while doing Pomodoro?',
            answer:
              'Yes, if it helps you settle in without repeatedly pulling your attention away. Responses to background music vary by person and task, so compare how you feel and work with music, ambient sound, and silence.',
          },
        ],
      },
      {
        type: 'cta',
        heading: 'Choose your focus space and begin one session.',
        buttonText: 'Start focusing',
        buttonHref: '/',
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

// Newest first, for the index page and sitemap.
export function sortedBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))
}
