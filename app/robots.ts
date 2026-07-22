import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    sitemap: 'https://nooktimer.com/sitemap.xml',
    rules: [
      // Allow regular search engine crawlers
      {
        userAgent: '*',
        allow: '/',
      },
      // Block AI training crawlers
      {
        userAgent: [
          'GPTBot',          // OpenAI
          'ChatGPT-User',    // OpenAI ChatGPT browsing
          'OAI-SearchBot',   // OpenAI search
          'ClaudeBot',       // Anthropic
          'anthropic-ai',    // Anthropic
          'Claude-Web',      // Anthropic
          'CCBot',           // Common Crawl (AI training datasets)
          'Google-Extended', // Google Gemini/Bard training
          'Applebot-Extended', // Apple AI
          'meta-externalagent', // Meta AI
          'Bytespider',      // ByteDance/TikTok
          'PerplexityBot',   // Perplexity AI
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
