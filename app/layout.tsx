import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { GA_MEASUREMENT_ID } from '@/lib/ga'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://nooktimer.com'),
  title: 'Do Not Disturb Timer',
  description:
    'A focus timer that belongs on your desk. A focus timer designed to become part of your workspace.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Do Not Disturb Timer',
    description: 'A focus timer that belongs on your desk.',
    url: 'https://nooktimer.com',
    siteName: 'Nook Timer',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
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
  manifest: '/manifest.json',
}

const isDev = process.env.NODE_ENV === 'development'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        {GA_MEASUREMENT_ID && (
          // Runs synchronously before gtag.js loads. Visiting once with ?ga_off=1
          // persists an opt-out flag (localStorage) that gtag.js checks on every
          // hit — including automatic pageviews — so it fully excludes this
          // browser from GA data. ?ga_on=1 clears it.
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{
                var k='dnd-timer-ga-opt-out';
                var p=new URLSearchParams(window.location.search);
                if(p.has('ga_off'))localStorage.setItem(k,'1');
                if(p.has('ga_on'))localStorage.removeItem(k);
                if(localStorage.getItem(k)==='1')window['ga-disable-${GA_MEASUREMENT_ID}']=true;
              }catch(e){}})();`,
            }}
          />
        )}
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
