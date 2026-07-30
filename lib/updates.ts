export interface UpdatePost {
  slug: string
  title: string
  date: string // ISO date, e.g. '2026-07-30'
  excerpt: string
  body: string[] // paragraphs, rendered as <p> tags
}

export const UPDATE_POSTS: UpdatePost[] = [
  {
    slug: 'easier-to-find',
    title: 'We just made NookTimer easier to find',
    date: '2026-07-30',
    excerpt:
      "A batch of behind-the-scenes changes to help more people actually find NookTimer when they're searching for a focus timer — plus a quick way to send us feedback.",
    body: [
      `Up until this week, if you searched Google for "focus timer," NookTimer basically didn't exist to search engines — the whole page was just JavaScript, with nothing for a crawler to actually read. That's fixed now: scroll down on the timer page and you'll see a real, readable section explaining what NookTimer is, how to use it, and answers to the questions people actually ask us.`,
      `We also added the structured data search engines use to build rich results, and a proper share card — so when you send a NookTimer link to a friend, it now shows an actual preview instead of a blank box.`,
      `The bigger change: we stopped blocking the AI bots that power ChatGPT and Perplexity search. If someone asks their AI assistant to recommend a focus timer, NookTimer now has a shot at showing up — we're still blocking the crawlers that only scrape content to train models, with zero benefit back to us, just not the ones that can actually send people here.`,
      `And if any of this breaks, looks weird, or you just have thoughts — there's a "Send feedback" link at the bottom of that new section. We read every one.`,
    ],
  },
]

export function getUpdatePost(slug: string): UpdatePost | undefined {
  return UPDATE_POSTS.find((post) => post.slug === slug)
}

// Newest first, for the index page and sitemap.
export function sortedUpdatePosts(): UpdatePost[] {
  return [...UPDATE_POSTS].sort((a, b) => b.date.localeCompare(a.date))
}
