import { Button } from '../ui'

export default function CTASection() {
  return (
    <section className="bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white px-5 py-9 text-center shadow-sm sm:px-10 sm:py-12">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-red-700">Digital transformation</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-2xl sm:text-3xl font-bold text-slate-900">
          A more transparent academic recruitment process
        </h2>

        <p className="text-slate-600 mt-4 text-sm sm:text-base">
          Join the institutional platform and follow every stage of your application.
        </p>

        <div className="mt-6">
          <Button variant="danger" size="md" onClick={() => window.location.href = "/sign-up"}>
            Access the system
          </Button>
        </div>
      </div>
    </section>
  )
}
