import { DM_Sans, Inter, Roboto_Mono } from 'next/font/google'

// Scoped to the marketing/blog routes that actually render font-dm/font-inter/
// font-mono (see app/blog/layout.tsx, app/updates/layout.tsx, app/about/page.tsx)
// — a font loader call is only preloaded on the routes that import it, so the
// timer app at "/" never fetches these. Weights mirror what was previously
// requested from Google Fonts' CDN.
export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--next-font-dm',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--next-font-inter',
  display: 'swap',
})

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--next-font-mono',
  display: 'swap',
})
