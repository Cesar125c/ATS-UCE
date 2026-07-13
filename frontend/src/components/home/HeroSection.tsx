import { Button } from '../ui'
import RegisterForm from './RegisterForm'
import { ArrowRight, CheckCircle2, FileSearch, ShieldCheck, Sparkles } from 'lucide-react'

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
          <Button variant="danger" size="md" className="flex items-center justify-center gap-2" onClick={() => document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })}>
            Start application <ArrowRight size={18} />
          </Button>

          <Button variant="outline" size="md" onClick={() => window.open("https://docs.uce.edu.ec", "_blank")}>
            View documentation
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-300">
          {["Secure information", "Traceable process", "Centralized evaluation"].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-sky-400" />{item}</span>)}
        </div>
      </div>

      {/* Right Form */}
      <div id="registro" className="w-full min-w-0 scroll-mt-24">
        <RegisterForm />
      </div>
      </div>
      <div id="beneficios" className="max-w-7xl mx-auto grid sm:grid-cols-3 border-t border-white/10">
        {[
          { icon: FileSearch, title: "Organized applications", text: "Documents and progress in one place." },
          { icon: Sparkles, title: "Assisted evaluation", text: "Consistent criteria supported by AI." },
          { icon: ShieldCheck, title: "Institutional security", text: "Role-based access and traceability." },
        ].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-4 px-5 sm:px-8 py-6 border-b sm:border-b-0 sm:border-r last:border-0 border-white/10"><Icon className="shrink-0 text-sky-400" size={23} /><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-400">{text}</p></div></div>)}
      </div>
    </section>
  )
}
