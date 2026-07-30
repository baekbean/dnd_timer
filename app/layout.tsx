import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { GA_MEASUREMENT_ID } from '@/lib/ga'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://nooktimer.com'),
  title: {
    default: 'NookTimer – Focus Timer for Your Space',
    template: '%s | NookTimer',
  },
  description:
    'An online focus timer that fits naturally into your workspace. Stay focused with calming scenes, ambient sounds, and a distraction-free experience.',
  keywords: [
    'focus timer',
    'pomodoro timer',
    'study timer',
    'online timer',
    'deep work',
    'productivity timer',
    'minimal timer',
    'ambient timer',
    'aesthetic timer',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NookTimer – Focus Timer for Your Space',
    description:
      'An online focus timer that fits naturally into your workspace. Stay focused with calming scenes, ambient sounds, and a distraction-free experience.',
    url: 'https://nooktimer.com',
    siteName: 'NookTimer',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NookTimer – Focus Timer for Your Space',
    description:
      'An online focus timer that fits naturally into your workspace. Stay focused with calming scenes, ambient sounds, and a distraction-free experience.',
  },
  appleWebApp: {
    capable: true,
    title: 'NookTimer',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
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
                // Internal-traffic opt-out: same ?internal=1 flag as PostHog
                // (instrumentation-client.ts). Tags every GA hit — including the
                // initial page_view and all later events — with
                // traffic_type=internal via gtag('set'), so the GA4
                // internal-traffic data filter excludes this browser regardless
                // of its (dynamic / IPv6) IP. ?internal=0 clears it.
                try {
                  var __p = new URLSearchParams(location.search).get('internal');
                  if (__p === '1') localStorage.setItem('dnd_internal', '1');
                  else if (__p === '0') localStorage.removeItem('dnd_internal');
                  if (localStorage.getItem('dnd_internal') === '1') {
                    gtag('set', { traffic_type: 'internal' });
                  }
                } catch (e) {}
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
