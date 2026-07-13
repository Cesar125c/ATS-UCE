import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

import HeroSection from '../components/home/HeroSection'
import CTASection from '../components/home/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />

      <main>
        <HeroSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}
