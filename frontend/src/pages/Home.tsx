import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

import HeroSection from '../components/home/HeroSection'

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />

      <main>
        <HeroSection />
      </main>

      <Footer />
    </div>
  )
}
