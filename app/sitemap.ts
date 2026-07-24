import type { MetadataRoute } from 'next'

const BASE_URL = 'https://nooktimer.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date('2026-07-24'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date('2026-07-24'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}
