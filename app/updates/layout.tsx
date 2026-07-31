import Link from 'next/link'

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-[#F6F6F3]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F6F6F3]">
        <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-5">
          <Link
            href="/"
            className="font-aspekta text-[16px] font-bold tracking-[-0.3px] text-[#343434] hover:opacity-70 transition-opacity"
          >
            NookTimer
          </Link>
        </div>
      </header>
      {children}
    </main>
  )
}
