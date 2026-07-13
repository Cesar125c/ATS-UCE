import Card from "../ui/Card";
import CandidateRow from "./CandidateRow";
import type { ApplicationRankingItem } from "@/services/dashboardService";

interface CandidateTableProps {
  items: ApplicationRankingItem[];
  loading?: boolean;
  onEvaluate: (applicationId: string) => void;
}

export default function CandidateTable({ items, loading, onEvaluate }: CandidateTableProps) {
  if (loading) {
    return (
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold">Applicant Ranking</h2>
          <p className="text-sm text-slate-500 mt-1">Applicants evaluated by AI, ordered by score.</p>
        </div>
        <div className="px-6 py-12 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-6 py-5 border-b">
        <h2 className="text-xl font-semibold">Applicant Ranking</h2>
        <p className="text-sm text-slate-500 mt-1">Applicants evaluated by AI, ordered by score.</p>
      </div>

      <div className="overflow-x-auto overscroll-x-contain table-scroll" tabIndex={0} aria-label="Applicant ranking table">
      <table className="w-full min-w-[900px]">
        <thead className="bg-slate-50">
          <tr className="text-left text-sm text-slate-600">
            <th className="px-6 py-3">Applicant</th>
            <th className="px-6 py-3">Vacancy</th>
            <th className="px-6 py-3">Faculty</th>
            <th className="px-6 py-3">Score</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <CandidateRow
              key={item.id}
              item={item}
              onEvaluate={onEvaluate}
            />
          ))}
        </tbody>
      </table>
      </div>

      {items.length === 0 && (
        <div className="px-6 py-12 text-center text-slate-500">
          No applications match this filter.
        </div>
      )}
    </Card>
  );
}
