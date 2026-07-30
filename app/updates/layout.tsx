import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-[#F6F6F3]">
      <Nav />
      {children}
      <Footer />
    </main>
  )
}
