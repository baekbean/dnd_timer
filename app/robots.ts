import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    sitemap: `${SITE_URL}/sitemap.xml`,
    rules: [
      // Allow regular search engine crawlers
      {
        userAgent: '*',
        allow: '/',
      },
      // Block pure AI-training crawlers (no referral traffic). AI search/answer
      // bots that can actually send users here — OAI-SearchBot, ChatGPT-User,
      // PerplexityBot — are deliberately left off this list and fall through
      // to the "*" allow rule above.
      {
        userAgent: [
          'GPTBot',          // OpenAI
          'ClaudeBot',       // Anthropic
          'anthropic-ai',    // Anthropic
          'Claude-Web',      // Anthropic
          'CCBot',           // Common Crawl (AI training datasets)
          'Google-Extended', // Google Gemini/Bard training
          'Applebot-Extended', // Apple AI
          'meta-externalagent', // Meta AI
          'Bytespider',      // ByteDance/TikTok
          'Diffbot',         // AI data extraction
          'omgili',          // Omgili data harvesting
          'omgilibot',
          'YouBot',          // You.com
          'PetalBot',        // Huawei AI
        ],
        disallow: '/',
      },
    ],
  }
}
