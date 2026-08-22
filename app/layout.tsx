import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { Reshaped } from 'reshaped'
import { GA_MEASUREMENT_ID } from '@/lib/ga'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/seo'
import './globals.css'
// Imported as a real ES import (not via @csstools/postcss-global-data —
// see postcss.config.mjs) so its @custom-media definitions land in
// Turbopack's tracked module graph, in the same concatenated global
// stylesheet as bundle.css's `@media (--rs-viewport-*)` usages.
import 'reshaped/themes/slate/media.css'
// slate's own token file — bundle.css has no theme tokens at all, only
// component styles that reference `var(--rs-*)`. Imported before
// reshaped-theme.css so our overrides win the cascade for the tokens both
// define, while everything neither of us touches (spacing units, duration/
// easing, font-weight scale, viewport breakpoints) still resolves from slate.
import 'reshaped/themes/slate/theme.css'
import 'reshaped/bundle.css'
import './reshaped-theme.css'

// Every string here reads from lib/seo.ts. These used to be hardcoded literals
// duplicated across description/openGraph/twitter, which let the SERP snippet,
// the share card, and the JSON-LD drift apart.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'aesthetic study timer',
    'study with me timer',
    'pomodoro timer',
    'focus timer no account',
    'focus timer without streaks',
    'youtube background timer',
    'tab title countdown timer',
    'ambient study timer',
    'deep work timer',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
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
        {/* "slate" supplies every base token (spacing, duration, easing,
            font-weight scale, viewport) our own theme doesn't redefine —
            "nooktimer" (app/reshaped-theme.css) layers brand overrides
            (color/font-family/radius/shadow) on top via CSS cascade. */}
        <Reshaped defaultTheme={['slate', 'nooktimer']} defaultColorMode="light">
          {children}
        </Reshaped>
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
