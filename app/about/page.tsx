import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Section1 from '@/components/Section1'
import Section2 from '@/components/Section2'
import Section3 from '@/components/Section3'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About – A Focus Timer That Belongs on Your Desk',
  description:
    'NookTimer is a focus timer designed to become part of your workspace — calming scenes, ambient sounds, and a desk-friendly design. Learn about the project and join the waitlist.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About NookTimer – A Focus Timer That Belongs on Your Desk',
    description:
      'NookTimer is a focus timer designed to become part of your workspace — calming scenes, ambient sounds, and a desk-friendly design.',
    url: `${SITE_URL}/about`,
    // Metadata merging is shallow — a page-level openGraph replaces the
    // layout's object entirely, so siteName/type must be repeated here.
    siteName: 'NookTimer',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <main className="bg-[#F6F6F3]">
      <Nav />
      <Hero />
      <Section2 />
      <Section1 />
      <Section3 />
      <Footer />
    </main>
  )
}
