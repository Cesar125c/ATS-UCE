import {
  Search,
  Filter,
  Plus,
} from "lucide-react";

import Button from "../ui/Button";

export default function VacancyFilters() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

      <div className="flex flex-1 gap-4">

        {/* Search */}

        <div className="relative flex-1">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Buscar vacante por título o facultad..."
            className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

        </div>

        {/* Filters */}

        <Button
          variant="outline"
          className="flex items-center gap-2"
        >

          <Filter size={18} />

          Filtros

        </Button>

      </div>

      {/* Button */}

      <Button
        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
      >

        <Plus size={18} />

        Nueva Vacante

      </Button>

    </div>
  );
}