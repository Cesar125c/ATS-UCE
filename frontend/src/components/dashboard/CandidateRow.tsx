import { useState } from "react";
import { FileText } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { getApplicationCVUrl } from "@/services/dashboardService";
import type { ApplicationRankingItem } from "@/services/dashboardService";
import type { FlowStatus } from "@/types/application";

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Recibido",
  PROCESSING_AI: "Analizando IA",
  HR_STAGE: "Revisión RRHH",
  DEAN_STAGE: "Decano",
  RECTOR_STAGE: "Rector",
  FINANCE_STAGE: "Financiero",
  HIRED: "Seleccionado",
  REJECTED: "Rechazado",
};

const STATUS_VARIANT: Record<string, "blue" | "green" | "red" | "yellow" | "cyan"> = {
  RECEIVED: "blue",
  PROCESSING_AI: "yellow",
  HR_STAGE: "cyan",
  DEAN_STAGE: "cyan",
  RECTOR_STAGE: "cyan",
  FINANCE_STAGE: "cyan",
  HIRED: "green",
  REJECTED: "red",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface CandidateRowProps {
  item: ApplicationRankingItem;
  onEvaluate: (applicationId: string) => void;
}

export default function CandidateRow({ item, onEvaluate }: CandidateRowProps) {
  const [cvLoading, setCvLoading] = useState(false);
  const status = item.status as FlowStatus;
  const score = item.score_total;

  const handleViewCV = async () => {
    if (!item.cv_storage_key) return;
    setCvLoading(true);
    try {
      const url = await getApplicationCVUrl(item.cv_storage_key);
      window.open(url, "_blank");
    } catch {
      // silently fail
    } finally {
      setCvLoading(false);
    }
  };

  return (
    <tr className="border-b hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center font-semibold text-red-600 text-sm">
            {getInitials(item.applicant_name || "—")}
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {item.applicant_name || "—"}
            </p>
            <p className="text-sm text-slate-500">
              {item.applicant_email || item.applicant_id.slice(0, 8)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-slate-700">
        {item.vacancy_title || "—"}
      </td>

      <td className="px-6 py-4 text-slate-700">
        {item.vacancy_faculty || "—"}
      </td>

      <td className="px-6 py-4">
        {score !== null && score !== undefined ? (
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

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewCV}
            disabled={cvLoading || !item.cv_storage_key}
          >
            <FileText size={14} className="mr-1" />
            CV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEvaluate(item.id)}
          >
            Evaluar
          </Button>
        </div>
      </td>
    </tr>
  );
}
