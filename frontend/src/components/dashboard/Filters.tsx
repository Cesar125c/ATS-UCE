import { Search, Filter, RotateCcw } from "lucide-react";
import Button from "../ui/Button";

export default function Filters() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Search */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search candidate..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />

        </div>

        {/* Position */}

        <select
          className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option>All Positions</option>
          <option>Frontend Developer</option>
          <option>Backend Developer</option>
          <option>UX/UI Designer</option>
          <option>Data Analyst</option>
        </select>

        {/* Status */}

        <select
          className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option>All Status</option>
          <option>Interview</option>
          <option>Review</option>
          <option>Pending</option>
          <option>Hired</option>
        </select>

        {/* Button */}

        <Button
          className="flex items-center justify-center gap-2"
          variant="outline"
        >
          <RotateCcw size={18} />

          Clear Filters

        </Button>

      </div>

    </div>
  );
}