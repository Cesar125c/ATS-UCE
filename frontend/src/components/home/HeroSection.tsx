import { Button, Badge } from '../ui'
import RegisterForm from './RegisterForm'

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
      
      {/* Left Content */}
      <div>
        <Badge variant="cyan">
          Universidad Central del Ecuador
        </Badge>

        <h2 className="text-5xl font-extrabold mt-6 leading-tight text-slate-900">
          Teacher Recruitment and Contract Management System
        </h2>

        <p className="text-slate-600 text-lg mt-6 leading-relaxed">
          ATS-UCE optimizes recruitment, evaluation, and
          teacher contract administration through a modern
          digital platform.
        </p>

        <div className="flex gap-4 mt-8">
          <Button variant="primary" size="md">
            Explore Platform
          </Button>

          <Button variant="outline" size="md">
            Documentation
          </Button>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full flex justify-center">
        <RegisterForm />
      </div>
    </section>
  )
}