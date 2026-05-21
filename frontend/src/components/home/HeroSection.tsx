export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <span className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold">
          Universidad Central del Ecuador
        </span>

        <h2 className="text-5xl font-extrabold mt-6 leading-tight">
          Teacher recruitment and contract management system.
        </h2>

        <p className="text-slate-600 text-lg mt-6 leading-relaxed">
          ATS-UCE optimizes the recruitment, evaluation,
           and administration of teacher contracts.
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

      <div className="bg-white rounded-3xl p-10 shadow-2xl">
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-slate-100 rounded-2xl p-5">
            <h3 className="text-3xl font-bold text-cyan-600">120+</h3>
            <p className="text-sm text-slate-600 mt-2">
              Applications
            </p>
          </div>

          <div className="bg-slate-100 rounded-2xl p-5">
            <h3 className="text-3xl font-bold text-cyan-600">45</h3>
            <p className="text-sm text-slate-600 mt-2">
              Recruitment Processes
            </p>
          </div>

          <div className="bg-slate-100 rounded-2xl p-5">
            <h3 className="text-3xl font-bold text-cyan-600">98%</h3>
            <p className="text-sm text-slate-600 mt-2">
              Digital Documentation
            </p>
          </div>

          <div className="bg-slate-100 rounded-2xl p-5">
            <h3 className="text-3xl font-bold text-cyan-600">24/7</h3>
            <p className="text-sm text-slate-600 mt-2">
              Platform Access
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}