import { MoreVertical } from "lucide-react";

export default function VacancyActions() {
  return (
    <button
      className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
    >
      <MoreVertical
        size={18}
        className="text-slate-500"
      />
    </button>
  );
}