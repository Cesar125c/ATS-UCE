import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

import HeroSection from '../components/home/HeroSection'
<<<<<<< HEAD
=======
//import FeaturesSection from '../components/home/FeaturesSection'
//import ProcessSection from '../components/home/ProcessSection'
>>>>>>> 26642c6e8ba0b7939a0cdf07e40ff879e1be1b5b
import CTASection from '../components/home/CTASection'

export default function Home() {
  return (
    <div className="bg-slate-100 min-h-screen">
      <Header />

      <main>
        <HeroSection />
<<<<<<< HEAD
=======
        {/* <FeaturesSection /> */}
        {/* <ProcessSection /> */}
>>>>>>> 26642c6e8ba0b7939a0cdf07e40ff879e1be1b5b
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}