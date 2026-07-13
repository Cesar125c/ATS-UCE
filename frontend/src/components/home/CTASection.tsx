import { Button } from '../ui'

export default function CTASection() {
  return (
    <section className="bg-slate-50 py-14 sm:py-20">
      <div className="max-w-5xl mx-auto text-center px-4 sm:px-6">
        <p className="text-sm font-bold uppercase tracking-widest text-red-700">Digital transformation</p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
          A more transparent academic recruitment process
        </h2>

        <p className="text-slate-600 mt-5 text-base sm:text-lg">
          Join the institutional platform and follow every stage of your application.
        </p>

        <div className="mt-8">
          <Button variant="danger" size="lg" onClick={() => window.location.href = "/sign-up"}>
            Access the system
          </Button>
        </div>
      </div>
    </section>
  )
}
