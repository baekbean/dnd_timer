import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { dmSans, inter, robotoMono } from '@/lib/fonts'

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={`bg-[#F6F6F3] ${dmSans.variable} ${inter.variable} ${robotoMono.variable}`}>
      <Nav overLightBackground />
      {children}
      <Footer showSocialLinks={false} />
    </main>
  )
}
