import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { SITE_NAME } from '@/lib/seo'

export const alt = 'NookTimer – an online focus timer with calming scenes and ambient sounds'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  const [aspekta, dinCondensed, sceneDusk] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/Aspekta-700.ttf')),
    readFile(join(process.cwd(), 'public/fonts/D-DIN-Condensed-Bold.woff')),
    readFile(join(process.cwd(), 'public/images/scene-dusk.jpg')),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={`data:image/jpeg;base64,${sceneDusk.toString('base64')}`}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: 'absolute', objectFit: 'cover' }}
        />
        {/* Legibility overlay, matching the in-app scene dimming */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(20,20,20,0.35) 0%, rgba(20,20,20,0.55) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: 'DIN Condensed',
              fontSize: 260,
              lineHeight: 1,
              color: '#f5f5f5',
            }}
          >
            25:00
          </div>
          <div
            style={{
              fontFamily: 'Aspekta',
              fontSize: 40,
              textTransform: 'uppercase',
              letterSpacing: 6,
              color: '#f5f5f5',
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              fontFamily: 'Aspekta',
              fontSize: 22,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'rgba(245,245,245,0.75)',
            }}
          >
            Focus timer for your space
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Aspekta', data: aspekta, style: 'normal', weight: 700 },
        { name: 'DIN Condensed', data: dinCondensed, style: 'normal', weight: 700 },
      ],
    }
  )
}
