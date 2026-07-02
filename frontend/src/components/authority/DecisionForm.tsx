import Card from "../ui/Card";

interface DecisionFormProps {
  observations: string;
  onObservationsChange: (value: string) => void;
  validationError: string | null;
  disabled?: boolean;
}

export default function DecisionForm({
  observations,
  onObservationsChange,
  validationError,
  disabled,
}: DecisionFormProps) {
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
          className={`w-full rounded-lg border p-4 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none ${
            validationError ? "border-red-400" : "border-slate-300"
          }`}
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          disabled={disabled}
        />

        {validationError && (
          <p className="text-xs text-red-600 mt-2">{validationError}</p>
        )}

        <p className="text-xs text-slate-500 mt-3">
          Estas observaciones serán registradas en el historial
          oficial del sistema y enviadas al departamento de
          talento humano.
        </p>
      </div>
    </Card>
  );
}
