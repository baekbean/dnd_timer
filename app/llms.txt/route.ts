import { FAQ_ITEMS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo'
import { sortedBlogPosts } from '@/lib/blog'
import { sortedUpdatePosts } from '@/lib/updates'

export const dynamic = 'force-static'

// llms.txt (llmstxt.org): a plain-text map of the site for AI/LLM crawlers,
// generated from the same lib/seo.ts + lib/blog.ts + lib/updates.ts sources
// as the sitemap and JSON-LD, so it can't drift out of sync with them.
export async function GET() {
  const lines: string[] = []

  lines.push(`# ${SITE_NAME}`, '', `> ${SITE_DESCRIPTION}`, '')
  lines.push(
    'No account, no gamification of any kind (not even optional), and a countdown ' +
      'that stays visible in the browser tab title. Free, runs entirely in-browser.',
    ''
  )

  lines.push('## Pages', '')
  lines.push(`- [Home](${SITE_URL}/): Start a focus session — timer, scenes, ambient sound, custom YouTube backgrounds.`)
  lines.push(`- [About](${SITE_URL}/about): What ${SITE_NAME} is and why it exists.`)
  lines.push('')

  const blogPosts = sortedBlogPosts()
  if (blogPosts.length > 0) {
    lines.push('## Guides', '')
    for (const post of blogPosts) {
      lines.push(`- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt}`)
    }
    lines.push('')
  }

  const updatePosts = sortedUpdatePosts()
  if (updatePosts.length > 0) {
    lines.push('## Updates', '')
    for (const post of updatePosts) {
      lines.push(`- [${post.title}](${SITE_URL}/updates/${post.slug}): ${post.excerpt}`)
    }
    lines.push('')
  }

  if (FAQ_ITEMS.length > 0) {
    lines.push('## FAQ', '')
    for (const item of FAQ_ITEMS) {
      lines.push(`- ${item.question} ${item.answer}`)
    }
    lines.push('')
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
