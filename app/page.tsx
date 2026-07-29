import TimerApp from '@/components/timer/TimerApp'
import SeoContent from '@/components/timer/SeoContent'
import { faqJsonLd, serializeJsonLd, webApplicationJsonLd } from '@/lib/seo'

export default function Home() {
  return (
    <>
      {/* Structured data — native script tag per the Next.js JSON-LD guide */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(webApplicationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd()) }}
      />
      <TimerApp />
      <SeoContent />
    </>
  )
}
