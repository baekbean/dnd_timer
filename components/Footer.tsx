import Image from 'next/image'

const socialLinks = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@hellodndroom' },
  { label: 'Instagram', href: 'https://www.instagram.com/dndtimer' },
  { label: 'Mail', href: 'mailto:hello.dndroom@gmail.com' },
]

type Props = {
  // /updates and /blog drop the social entry points — those pages are
  // reading-focused, and the social links pull attention away from
  // "Read next"/the feedback link without adding anything post-specific.
  showSocialLinks?: boolean
}

export default function Footer({ showSocialLinks = true }: Props = {}) {
  return (
    <footer className="relative w-full pt-[40px] pb-[100px] px-4 md:px-10 overflow-hidden">
      {/* Background texture */}
      <Image
        src="/images/footer-bg.png"
        alt=""
        fill
        className="object-cover pointer-events-none"
      />

      <div className="relative flex items-end gap-10 w-full">
        {/* Logo */}
        <Image
          src="/images/logo-wordmark.png"
          alt="NookTimer"
          width={87}
          height={17}
          className="flex-shrink-0"
        />

        {/* Copyright */}
        <div className="flex-1">
          <p className="font-mono text-[12px] text-[#343434] tracking-[-0.12px] leading-[1.4]">
            © 2026 Nook Timer
          </p>
        </div>

        {/* Social links */}
        {showSocialLinks && (
          <div className="font-mono text-[12px] text-[#343434] tracking-[-0.12px] leading-[1.4] w-[336px] text-right">
            {socialLinks.map((link, i) => (
              <span key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="hover:underline transition-opacity hover:opacity-60"
                >
                  {link.label}
                </a>
                {i < socialLinks.length - 1 && (
                  <span className="mx-2">·</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
