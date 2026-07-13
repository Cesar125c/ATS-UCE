import { Button } from '../ui'
import RegisterForm from './RegisterForm'
import { Sparkles } from 'lucide-react'

export default function HeroSection() {
  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-gradient-to-br from-[#071429] via-[#0b2445] to-[#123b64] text-white">
      <div className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,#38bdf8_0,transparent_35%),radial-gradient(circle_at_85%_70%,#2563eb_0,transparent_30%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24 grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-16 items-center">
      
      {/* Left Content */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-sky-100"><Sparkles size={15} /> Universidad Central del Ecuador</div>

        <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight">
          Academic talent, managed with <span className="text-sky-400">clarity and efficiency.</span>
        </h2>

        <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-300">
          A unified platform for teacher applications, AI-assisted evaluation and transparent monitoring throughout the selection process.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button variant="danger" size="md" onClick={() => window.location.href = "/sign-up"}>
            Explore Platform
          </Button>

          <Button variant="outline" size="md" onClick={() => window.open("https://docs.uce.edu.ec", "_blank")}>
            View documentation
          </Button>
        </div>
      </div>

      {/* Right Form */}
      <div id="registro" className="w-full min-w-0 scroll-mt-24">
        <RegisterForm />
      </div>
      </div>
    </section>
  )
}
