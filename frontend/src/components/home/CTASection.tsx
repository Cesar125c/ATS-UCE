import { Button } from '../ui'

export default function CTASection() {
  return (
    <section className="bg-slate-900 text-white py-24">
      <div className="max-w-5xl mx-auto text-center px-6">
        <h2 className="text-4xl font-bold">
          Improve Academic Recruitment Efficiency
        </h2>

        <p className="text-slate-300 mt-6 text-lg">
          Modernize teacher hiring workflows with ATS-UCE.
        </p>

        <div className="mt-8">
          <Button variant="secondary" size="lg">
            Access the System
          </Button>
        </div>
      </div>
    </section>
  )
}