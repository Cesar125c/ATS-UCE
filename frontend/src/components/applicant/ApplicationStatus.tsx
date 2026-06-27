import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Circle, Clock3, Eye, XCircle, Loader2 } from "lucide-react";
import Card from "../ui/Card";
import { getMyApplicationStatus } from "@/services/applicationService";
import type { ApplicationResponse, FlowStatus, StatusHistoryDTO } from "@/types/application";

const STEP_ORDER: FlowStatus[] = [
  "RECEIVED",
  "PROCESSING_AI",
  "HR_STAGE",
  "DEAN_STAGE",
  "RECTOR_STAGE",
  "FINANCE_STAGE",
  "HIRED",
];

const STEP_LABELS: Record<FlowStatus, string> = {
  RECEIVED: "Recibido",
  PROCESSING_AI: "Validación IA",
  HR_STAGE: "Revisión RRHH",
  DEAN_STAGE: "Decano",
  RECTOR_STAGE: "Rector",
  FINANCE_STAGE: "Financiero",
  HIRED: "Seleccionado",
  REJECTED: "Rechazado",
};

const STATUS_MESSAGE: Record<string, { title: string; detail: string }> = {
  RECEIVED: {
    title: "Tu postulación ha sido recibida.",
    detail:
      "Recibimos tu CV correctamente. El análisis mediante IA comenzará en breve.",
  },
  PROCESSING_AI: {
    title: "Analizando tu CV mediante IA...",
    detail:
      "El sistema está evaluando tu perfil automáticamente. Este proceso puede tardar unos minutos. La página se actualizará automáticamente.",
  },
  HR_STAGE: {
    title: "Tu postulación se encuentra en Revisión RRHH.",
    detail:
      "Estamos verificando la validez de tus certificados. Recibirás un correo con novedades en las próximas 48 horas.",
  },
  DEAN_STAGE: {
    title: "Tu postulación está en revisión del Decano.",
    detail:
      "La autoridad académica está evaluando tu perfil para la vacante.",
  },
  RECTOR_STAGE: {
    title: "Tu postulación está en revisión del Rector.",
    detail:
      "La máxima autoridad está revisando tu postulación.",
  },
  FINANCE_STAGE: {
    title: "Tu postulación está en revisión Financiera.",
    detail:
      "El departamento financiero está validando la disponibilidad presupuestaria.",
  },
  HIRED: {
    title: "¡Felicitaciones! Has sido seleccionado.",
    detail:
      "Tu postulación fue aprobada. Recibirás un correo con los siguientes pasos.",
  },
  REJECTED: {
    title: "Tu postulación no ha sido seleccionada.",
    detail:
      "Lamentablemente tu perfil no fue seleccionado en esta ocasión. Puedes postular a otras vacantes disponibles.",
  },
};

const POLL_INTERVAL_MS = 10000;
const TERMINAL_STATUSES: FlowStatus[] = ["HIRED", "REJECTED"];

function computeStepStatus(
  flowStep: FlowStatus,
  historyStatuses: Set<string>,
  currentStatus: FlowStatus,
): "completed" | "current" | "pending" {
  if (historyStatuses.has(flowStep)) {
    return flowStep === currentStatus ? "current" : "completed";
  }
  return "pending";
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
}

function getStepDate(
  flowStep: FlowStatus,
  history: StatusHistoryDTO[],
): string {
  const entry = history.find((h) => h.status === flowStep);
  return entry ? formatDate(entry.transitioned_at) : "--";
}

export default function ApplicationStatus() {
  const [applications, setApplications] = useState<ApplicationResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousStatusRef = useRef<FlowStatus | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await getMyApplicationStatus();
      setApplications(data);
      setError(null);
    } catch {
      setError("Error al cargar el estado de la postulación.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (!applications || applications.length === 0) return;

    const currentStatus = applications[0].status;

    if (currentStatus === "PROCESSING_AI") {
      if (!pollRef.current) {
        pollRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
      }
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [applications]);

  if (loading) {
    return (
      <Card className="p-6 mt-6 text-center text-slate-500">
        Cargando estado de postulación...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 mt-6 text-center text-red-600">
        {error}
      </Card>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card className="p-6 mt-6 text-center text-slate-500">
        No tienes postulaciones registradas. Sube tu CV para comenzar.
      </Card>
    );
  }

  const currentApp = applications[0];
  const history = currentApp.status_history || [];
  const historyStatuses = new Set(history.map((h) => h.status));
  const currentStatus = currentApp.status;
  const message = STATUS_MESSAGE[currentStatus] ?? {
    title: "Estado desconocido",
    detail: "",
  };

  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
  const isProcessingAI = currentStatus === "PROCESSING_AI";

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold">
            Estado de Tu Postulación
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Seguimiento en tiempo real del proceso de selección.
          </p>

          {isProcessingAI && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              Actualizando cada 10 segundos
            </p>
          )}
        </div>

        <span className="text-xs bg-slate-100 rounded-full px-3 py-1 font-mono">
          ID: {currentApp.id.slice(0, 8)}
        </span>
      </div>

      <div className="flex justify-between items-center mb-10">
        {STEP_ORDER.map((step, index) => {
          const stepStatus = computeStepStatus(step, historyStatuses, currentStatus);
          const isLastInOrder = index === STEP_ORDER.length - 1;
          const connectorColor =
            stepStatus === "completed" ? "bg-sky-500" : "bg-slate-200";
          const isCurrentProcessingAI =
            stepStatus === "current" && step === "PROCESSING_AI";

          return (
            <div
              key={step}
              className="flex-1 flex flex-col items-center relative"
            >
              {!isLastInOrder && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-[2px] ${connectorColor}`}
                />
              )}

              <div className="relative z-10">
                {stepStatus === "completed" && (
                  <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                    <CheckCircle2 size={18} />
                  </div>
                )}

                {isCurrentProcessingAI && (
                  <div className="w-10 h-10 rounded-full border-4 border-amber-500 bg-white flex items-center justify-center">
                    <Loader2 size={18} className="text-amber-500 animate-spin" />
                  </div>
                )}

                {stepStatus === "current" && !isCurrentProcessingAI && (
                  <div className="w-10 h-10 rounded-full border-4 border-sky-500 bg-white flex items-center justify-center">
                    <Clock3 size={18} className="text-sky-500" />
                  </div>
                )}

                {stepStatus === "pending" && (
                  <div className="w-10 h-10 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center">
                    <Circle size={14} className="text-slate-300" />
                  </div>
                )}
              </div>

              <p className="font-medium text-sm mt-3">{STEP_LABELS[step]}</p>

              <p className="text-xs text-slate-500">
                {isCurrentProcessingAI
                  ? "En curso..."
                  : getStepDate(step, history)}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className={`rounded-lg p-4 flex gap-3 ${
          currentStatus === "REJECTED"
            ? "bg-red-50 border border-red-200"
            : currentStatus === "HIRED"
              ? "bg-emerald-50 border border-emerald-200"
              : isProcessingAI
                ? "bg-amber-50 border border-amber-200"
                : "bg-sky-50 border border-sky-200"
        }`}
      >
        {isProcessingAI ? (
          <Loader2 className="text-amber-500 mt-1 shrink-0 animate-spin" size={18} />
        ) : currentStatus === "REJECTED" ? (
          <XCircle className="text-red-500 mt-1 shrink-0" size={18} />
        ) : currentStatus === "HIRED" ? (
          <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
        ) : (
          <Eye className="text-sky-500 mt-1 shrink-0" size={18} />
        )}

        <div>
          <h4 className="font-semibold">{message.title}</h4>

          <p className="text-sm text-slate-600 mt-1">{message.detail}</p>

          {isTerminal && currentStatus === "HIRED" && (
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">
                Resultado final: {currentApp.ai_score?.grade ?? "—"}
              </p>
              {currentApp.ai_score && (
                <p className="text-xs text-emerald-700 mt-1">
                  Puntaje total: {currentApp.ai_score.total}/100
                </p>
              )}
            </div>
          )}

          {isTerminal && currentStatus === "REJECTED" && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-sm font-medium text-red-800">
                Puedes postular a otras vacantes disponibles desde la sección de carga de CV.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
