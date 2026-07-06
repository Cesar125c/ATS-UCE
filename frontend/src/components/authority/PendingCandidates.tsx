import Card from "../ui/Card";
import CandidateCard from "./CandidateCard";
import { Clock3 } from "lucide-react";
import type { ApplicationRankingItem } from "@/services/dashboardService";

interface PendingCandidatesProps {
  applications: ApplicationRankingItem[];
  selectedId: string | null;
  onSelect: (app: ApplicationRankingItem) => void;
  loading?: boolean;
}

export default function PendingCandidates({
  applications,
  selectedId,
  onSelect,
  loading,
}: PendingCandidatesProps) {
  const byStatusOrder: Record<string, number> = {
    DEAN_STAGE: 0,
    RECTOR_STAGE: 1,
    FINANCE_STAGE: 2,
  };

  const sorted = [...applications].sort(
    (a, b) => (byStatusOrder[a.status] ?? 99) - (byStatusOrder[b.status] ?? 99),
  );

  return (
    <Card className="p-0 overflow-hidden h-full">
      <div className="p-5 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock3 size={18} className="text-sky-600" />
          <h2 className="font-semibold">Pendientes de Aprobación</h2>
        </div>
        <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-semibold">
          {applications.length}
        </span>
      </div>

      {loading && <p className="p-5 text-sm text-slate-500">Cargando...</p>}

      {sorted.map((app) => (
        <CandidateCard
          key={app.id}
          candidate={app}
          selected={app.id === selectedId}
          onClick={() => onSelect(app)}
        />
      ))}

      {!loading && applications.length === 0 && (
        <p className="p-5 text-sm text-slate-500">No hay postulaciones pendientes.</p>
      )}
    </Card>
  );
}
