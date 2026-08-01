export interface UpdatePost {
  slug: string
  title: string
  date: string // ISO date, e.g. '2026-07-30'
  excerpt: string
  body: string[] // paragraphs, rendered as <p> tags
}

export const UPDATE_POSTS: UpdatePost[] = [
  {
    slug: 'new-sounds-and-custom-backgrounds',
    title: 'New sounds and a background of your own',
    date: '2026-07-30',
    excerpt:
      "Paste any YouTube link to make it your background, and pick from five new ambient sounds — real field recordings, not just synthesized noise.",
    body: [
      `Couldn't find a built-in scene that matched your mood? You can now paste a YouTube link and turn it into your background. Whether it's a lo-fi mix, a crackling fireplace, or a late-night drive, choose whatever helps you settle in and focus.`,
      `We've also added five new ambient sounds: white noise, rain, birdsong, garden crickets, and night bugs. You'll still find the original brown noise too. Four of the new sounds are real field recordings, bringing a little more of the outside world into your focus space.`,
      `Try the new update and let us know how it feels. What's missing? What would make NookTimer feel even more like your space? We read every message.`,
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
