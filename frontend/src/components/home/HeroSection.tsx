import RegisterForm from './RegisterForm'

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
      
      {/* Left Content */}
      <div>
        <span className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold">
          Universidad Central del Ecuador
        </span>

        <h2 className="text-5xl font-extrabold mt-6 leading-tight text-slate-900">
          Teacher Recruitment and Contract Management System
        </h2>

        <p className="text-slate-600 text-lg mt-6 leading-relaxed">
          ATS-UCE optimizes recruitment, evaluation, and
          teacher contract administration through a modern
          digital platform.
        </p>

        <div className="flex gap-4 mt-8">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition">
            Explore Platform
          </button>

          <button className="border border-slate-300 bg-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-100 transition">
            Documentation
          </button>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full flex justify-center">
        <RegisterForm />
      </div>
    </section>
  )
}