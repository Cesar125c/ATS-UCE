import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { submitEvaluation, validateEvaluation } from "@/services/evaluationService";
import type { EvaluationRequest } from "@/services/evaluationService";

interface EvaluationModalProps {
  applicationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EvaluationModal({ applicationId, onClose, onSuccess }: EvaluationModalProps) {
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [observations, setObservations] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const body: EvaluationRequest = { decision, observations };
    const error = validateEvaluation(body);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setServerError(null);
    setIsSubmitting(true);

    try {
      await submitEvaluation(applicationId, body);
      onSuccess();
    } catch (e: any) {
      const msg = e?.message || "Error al registrar la decisión.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X size={20} />
        </button>

        <Card className="p-6 border-0 shadow-none">
          <h2 className="text-xl font-semibold mb-6">Decisión de RRHH</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Decisión
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="APPROVED"
                    checked={decision === "APPROVED"}
                    onChange={() => setDecision("APPROVED")}
                    className="accent-green-600"
                  />
                  <span className="text-sm font-medium text-green-700">APROBADO</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="REJECTED"
                    checked={decision === "REJECTED"}
                    onChange={() => setDecision("REJECTED")}
                    className="accent-red-600"
                  />
                  <span className="text-sm font-medium text-red-700">RECHAZADO</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Observaciones
                {decision === "REJECTED" && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <textarea
                rows={4}
                placeholder="Justificación de la decisión..."
                className={`w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none ${
                  validationError ? "border-red-400" : "border-slate-300"
                }`}
                value={observations}
                onChange={(e) => {
                  setObservations(e.target.value);
                  setValidationError(null);
                }}
                disabled={isSubmitting}
              />
              {validationError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {validationError}
                </p>
              )}
            </div>

            {serverError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                variant="secondary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                Registrar Decisión
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
