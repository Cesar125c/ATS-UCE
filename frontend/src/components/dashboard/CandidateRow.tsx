import type { ApplicationResponse, FlowStatus } from "@/types/application";
import type { Vacancy } from "@/types/vacancy";
import Badge from "../ui/Badge";

const STATUS_LABEL: Record<FlowStatus, string> = {
  RECEIVED: "Recibido",
  PROCESSING_AI: "Analizando IA",
  HR_STAGE: "Revisión RRHH",
  DEAN_STAGE: "Decano",
  RECTOR_STAGE: "Rector",
  FINANCE_STAGE: "Financiero",
  HIRED: "Seleccionado",
  REJECTED: "Rechazado",
};

const STATUS_VARIANT: Record<FlowStatus, "blue" | "green" | "red" | "yellow" | "cyan"> = {
  RECEIVED: "blue",
  PROCESSING_AI: "yellow",
  HR_STAGE: "cyan",
  DEAN_STAGE: "cyan",
  RECTOR_STAGE: "cyan",
  FINANCE_STAGE: "cyan",
  HIRED: "green",
  REJECTED: "red",
};

function getInitials(app: ApplicationResponse): string {
  return app.id.slice(0, 2).toUpperCase();
}

interface CandidateRowProps {
  application: ApplicationResponse;
  vacancy: Vacancy | undefined;
}

export default function CandidateRow({ application, vacancy }: CandidateRowProps) {
  const status = application.status as FlowStatus;
  const score = application.ai_score?.total;

  return (
    <tr className="border-b hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center font-semibold text-red-600 text-sm">
            {getInitials(application)}
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {vacancy?.title ?? `Postulante ${application.applicant_id.slice(0, 8)}`}
            </p>
            <p className="text-sm text-slate-500">ID: {application.id.slice(0, 8)}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-slate-700">
        {vacancy?.title ?? application.vacancy_id.slice(0, 8)}
      </td>

      <td className="px-6 py-4 text-slate-700">
        {vacancy?.faculty ?? "—"}
      </td>

      <td className="px-6 py-4">
        {score !== undefined ? (
          <div className="flex items-center gap-3">
            <div className="w-28 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="bg-red-600 h-full rounded-full"
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="font-semibold text-sm">{Math.round(score)}%</span>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        )}
      </td>

      <td className="px-6 py-4">
        <Badge variant={STATUS_VARIANT[status] ?? "blue"} size="sm">
          {STATUS_LABEL[status] ?? status}
        </Badge>
      </td>
    </tr>
  );
}
