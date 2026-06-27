import Card from "../ui/Card";

export default function DecisionForm() {
  return (
    <Card className="p-6">

      <h2 className="text-xl font-semibold mb-6">
        Ficha de Decisión de Autoridad
      </h2>

      <div>

        <label className="block text-sm font-medium text-slate-700 mb-3">
          Observaciones y Justificación
        </label>

        <textarea
          rows={5}
          placeholder="Ingrese las observaciones finales para la resolución de contratación..."
          className="w-full rounded-lg border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
        />

        <p className="text-xs text-slate-500 mt-3">
          Estas observaciones serán registradas en el historial
          oficial del sistema y enviadas al departamento de
          talento humano.
        </p>

      </div>

    </Card>
  );
}