import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
} from "lucide-react";

import Button from "../ui/Button";

interface VacancyFiltersProps {
  search: string;
  onSearchChange: (s: string) => void;
  onNew: () => void;
}

export default function VacancyFilters({ search, onSearchChange, onNew }: VacancyFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div className="flex min-w-0 flex-1 flex-col sm:flex-row gap-3 sm:gap-4">

          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search vacancy by title or faculty..."
              className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Filters toggle */}
          <Button
            variant="outline"
            className={`flex items-center gap-2 ${showFilters ? "border-red-400 text-red-600" : ""}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter size={18} />
            Filters
          </Button>

        </div>

        {/* New vacancy */}
        <Button
          variant="danger"
          onClick={onNew}
          className="flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          New Vacancy
        </Button>

      </div>

      {/* Advanced filter panel */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Faculty
            </label>
            <input
              type="text"
              placeholder="e.g. Engineering"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Department
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Systems"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div className="flex items-end">
            <span className="text-xs text-slate-400 pb-2">
              Advanced filters — coming soon
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
