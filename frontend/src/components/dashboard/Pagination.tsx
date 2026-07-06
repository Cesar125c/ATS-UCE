import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const end = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
      <p className="text-sm text-slate-500">
        Mostrando{" "}
        <span className="font-semibold text-slate-800">
          {start}-{end}
        </span>{" "}
        de{" "}
        <span className="font-semibold text-slate-800">{totalItems}</span>{" "}
        postulantes
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          className="flex items-center gap-2"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} />
          Anterior
        </Button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
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
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
