const steps = [
  'Application',
  'Evaluation',
  'Selection',
  'Contract Approval',
]

export default function ProcessSection() {
  return (
    <section className="py-24 bg-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold">
            Recruitment Workflow
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step}
              className="bg-white rounded-3xl p-8 shadow-md text-center"
            >
              <div className="w-14 h-14 rounded-full bg-cyan-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-5">
                {index + 1}
              </div>

              <h3 className="font-bold text-lg">{step}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}