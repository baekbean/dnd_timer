import Image from 'next/image'

const socialLinks = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@dndtimer' },
  { label: 'Instagram', href: 'https://www.instagram.com/dndtimer' },
  { label: 'Mail', href: 'mailto:hello.dndroom@gmail.com' },
]

export default function Footer() {
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
          src="/images/logo-dark.png"
          alt="Do not Disturb Timer"
          width={169}
          height={17}
          className="flex-shrink-0"
        />

        {/* Copyright */}
        <div className="flex-1">
          <p className="font-mono text-[12px] text-[#343434] tracking-[-0.12px] leading-[1.4]">
            © 2026 Do not Disturb Timer
            <span className="mx-2">·</span>
            <a href="/timer" className="hover:underline transition-opacity hover:opacity-60">
              Try the timer (beta)
            </a>
          </p>
        </div>

        {/* Social links */}
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
      </div>
    </footer>
  )
}
