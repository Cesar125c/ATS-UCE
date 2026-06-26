import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../ui/Button";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
}

export default function Pagination({
  currentPage = 1,
  totalPages = 6,
  totalItems = 24,
  pageSize = 4,
}: PaginationProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">

      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-800">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-800">
          {totalItems}
        </span>{" "}
        candidates
      </p>

      <div className="flex items-center gap-2">

        <Button
          variant="outline"
          disabled={currentPage === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;

          return (
            <button
              key={page}
              className={`w-10 h-10 rounded-lg transition-all ${
                page === currentPage
                  ? "bg-red-600 text-white"
                  : "border border-slate-300 hover:bg-slate-100"
              }`}
            >
              {page}
            </button>
          );
        })}

        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight size={16} />
        </Button>

      </div>

    </div>
  );
}