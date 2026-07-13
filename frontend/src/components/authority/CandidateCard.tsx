import Badge from "../ui/Badge";
import type { ApplicationRankingItem } from "@/services/dashboardService";

const STATUS_LABEL: Record<string, string> = {
  DEAN_STAGE: "Dean",
  RECTOR_STAGE: "Rector",
  FINANCE_STAGE: "Finance",
};

interface CandidateCardProps {
  candidate: ApplicationRankingItem;
  selected?: boolean;
  onClick?: () => void;
}

export default function CandidateCard({
  candidate,
  selected = false,
  onClick,
}: CandidateCardProps) {
  const stageLabel = STATUS_LABEL[candidate.status] || candidate.status;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border-b transition-all p-5 ${
        selected
          ? "border-l-4 border-l-sky-500 bg-sky-50"
          : "hover:bg-slate-50"
      }`}
    >
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">
            {candidate.applicant_name}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {candidate.vacancy_title}
          </p>
          <p className="text-xs uppercase text-slate-400 mt-1">
            {candidate.vacancy_faculty} · {stageLabel}
          </p>
        </div>
        <Badge variant="primary">
          AI {candidate.score_total ?? "—"}
        </Badge>
      </div>
    </div>
  );
}
