import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

const BASE_URL = SITE_URL

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date('2026-07-30'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date('2026-07-30'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}
