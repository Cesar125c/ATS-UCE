const features = [
  {
    title: 'Application Management',
    icon: '📄',
    description:
      'Manage teacher applications and academic documents centrally.',
  },
  {
    title: 'Candidate Evaluation',
    icon: '👨‍🏫',
    description:
      'Evaluate qualifications, certifications, and experience.',
  },
  {
    title: 'Contract Administration',
    icon: '📝',
    description:
      'Generate and manage digital teacher contracts.',
  },
  {
    title: 'Analytics & Reports',
    icon: '📊',
    description:
      'Access hiring metrics and recruitment reports.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold">
            Core Platform Features
          </h2>

          <p className="text-slate-600 mt-4">
            Complete digital tools for teacher recruitment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-50 rounded-3xl p-7 hover:shadow-xl transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>

              <h3 className="text-xl font-bold mb-3">
                {feature.title}
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}