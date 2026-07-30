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
  {
    slug: 'new-sounds-and-custom-backgrounds',
    title: 'New sounds, and pick your own background',
    date: '2026-07-30',
    excerpt:
      'Paste any YouTube link to use it as your scene, and choose from five new ambient sounds — real recordings, not just synthesized noise.',
    body: [
      `If none of the built-in scenes matched your vibe, you can now paste any YouTube link and use it as your background. A lo-fi mix, a fireplace loop, a windows-down highway drive at night — whatever gets you into your zone, drop the link in and it becomes your timer.`,
      `We also expanded the ambient sound options from one synthesized noise bed to six: brown noise, white noise, rain, birdsong, garden crickets, and night bugs. Four of those are real field recordings, not approximations — pick whichever one gets you focused.`,
      `Try it out and let us know what you think — what's missing, what feels off, what you'd want next. We read every message.`,
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
