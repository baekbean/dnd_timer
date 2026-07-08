import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { GA_MEASUREMENT_ID } from '@/lib/ga'
import CopyProtection from '@/components/CopyProtection'
import './globals.css'

export const metadata: Metadata = {
  title: 'Do Not Disturb Timer',
  description:
    'A focus timer that belongs on your desk. A focus timer designed to become part of your workspace.',
  openGraph: {
    title: 'Do Not Disturb Timer',
    description: 'A focus timer that belongs on your desk.',
  },
  appleWebApp: {
    capable: true,
    title: 'DND Timer',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/icons/icon-180.png',
  },
}

const isDev = process.env.NODE_ENV === 'development'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@700&family=Inter:wght@400;500;700&family=Roboto+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <CopyProtection />
        {children}
        <Analytics />

        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', ${
                  isDev
                    ? JSON.stringify({ debug_mode: true })
                    : '{}'
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
