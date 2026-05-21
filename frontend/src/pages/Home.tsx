import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

import HeroSection from '../components/home/HeroSection'
//import FeaturesSection from '../components/home/FeaturesSection'
//import ProcessSection from '../components/home/ProcessSection'
import CTASection from '../components/home/CTASection'

export default function Home() {
  return (
    <div className="bg-slate-100 min-h-screen">
      <Header />

      <main>
        <HeroSection />
        {/* <FeaturesSection /> */}
        {/* <ProcessSection /> */}
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}