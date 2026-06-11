export default function HumanResources() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full rounded-3xl bg-white p-10 shadow-2xl border border-slate-200">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Bienvenido, Human Resources
        </h1>

        <p className="text-lg text-slate-700 mb-6">
          Has ingresado a la página correspondiente a tu rol.
        </p>

        <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
          <p className="text-slate-600">
            Rol asignado: <span className="font-semibold">human_resources</span>
          </p>
        </div>
      </div>
    </div>
  )
}
