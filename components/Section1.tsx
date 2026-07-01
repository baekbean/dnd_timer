import Image from 'next/image'

const images = [
  { src: '/images/ws-1.jpg', alt: 'Cozy desk with plants and books' },
  { src: '/images/ws-2.jpg', alt: 'Minimal setup with laptop by window' },
  { src: '/images/ws-3.jpg', alt: 'Bright workspace with shelves' },
  { src: '/images/ws-4.jpg', alt: 'Evening desk with city view' },
  { src: '/images/ws-5c.jpg', alt: 'Night workspace with candles' },
  { src: '/images/ws-6.jpg', alt: 'Developer setup with multiple screens' },
]

export default function Section1() {
  return (
    <section className="w-full flex flex-col items-center pb-[200px]">
      <div className="w-full max-w-[908px] px-4 md:px-0 flex flex-col gap-[60px]">
        {/* Title */}
        <div className="flex flex-col gap-4 items-center text-center">
          <h2 className="font-aspekta uppercase text-[28px] md:text-[40px] leading-[1.3] text-[#343434]">
            Romanticize<br />
            your workspace.
          </h2>
          <p className="font-pretendard text-[16px] text-[#343434] tracking-[-0.08px] leading-[1.4] w-full md:w-[448px]">
            Whether you&apos;re studying, writing, creating, or working from home<br className="hidden md:block" />
            your screen deserves to feel intentional.
          </p>
        </div>

        {/* Image grid — 1 col on mobile, 3 cols on desktop */}
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {images.slice(0, 3).map((img) => (
              <div key={img.src} className="relative rounded-lg overflow-hidden h-[280px] md:h-[360px]">
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) calc(100vw - 32px), 281px" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {images.slice(3, 6).map((img) => (
              <div key={img.src} className="relative rounded-lg overflow-hidden h-[280px] md:h-[360px]">
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) calc(100vw - 32px), 281px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
