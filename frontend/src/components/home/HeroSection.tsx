<<<<<<< HEAD
import { Button, Badge } from '../ui'
=======
>>>>>>> 26642c6e8ba0b7939a0cdf07e40ff879e1be1b5b
import RegisterForm from './RegisterForm'

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
      
      {/* Left Content */}
      <div>
<<<<<<< HEAD
        <Badge variant="cyan">
          Universidad Central del Ecuador
        </Badge>
=======
        <span className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold">
          Universidad Central del Ecuador
        </span>
>>>>>>> 26642c6e8ba0b7939a0cdf07e40ff879e1be1b5b

        <h2 className="text-5xl font-extrabold mt-6 leading-tight text-slate-900">
          Teacher Recruitment and Contract Management System
        </h2>

        <p className="text-slate-600 text-lg mt-6 leading-relaxed">
          ATS-UCE optimizes recruitment, evaluation, and
          teacher contract administration through a modern
          digital platform.
        </p>

        <div className="flex gap-4 mt-8">
<<<<<<< HEAD
          <Button variant="primary" size="md">
            Explore Platform
          </Button>

          <Button variant="outline" size="md">
            Documentation
          </Button>
=======
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition">
            Explore Platform
          </button>

          <button className="border border-slate-300 bg-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-100 transition">
            Documentation
          </button>
>>>>>>> 26642c6e8ba0b7939a0cdf07e40ff879e1be1b5b
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full flex justify-center">
        <RegisterForm />
      </div>
    </section>
  )
}