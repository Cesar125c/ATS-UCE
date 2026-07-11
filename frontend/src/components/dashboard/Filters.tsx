import { Search, RotateCcw } from "lucide-react";
import Button from "../ui/Button";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "RECEIVED", label: "Received" },
  { value: "PROCESSING_AI", label: "AI Analysis" },
  { value: "HR_STAGE", label: "HR Review" },
  { value: "DEAN_STAGE", label: "Dean" },
  { value: "RECTOR_STAGE", label: "Rector" },
  { value: "FINANCE_STAGE", label: "Finance" },
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Rejected" },
];

interface FiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

export default function Filters({ status, onStatusChange, search, onSearchChange }: FiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search applicants..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Button
          className="flex items-center justify-center gap-2"
          variant="outline"
          onClick={() => onStatusChange("")}
        >
          <RotateCcw size={18} />
          Clear filters
        </Button>
      </div>
    </div>
  );
}
