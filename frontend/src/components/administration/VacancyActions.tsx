import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, Eye } from "lucide-react";

interface VacancyActionsProps {
  onDeactivate?: () => void;
  onView?: () => void;
}

export default function VacancyActions({ onDeactivate, onView }: VacancyActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
        title="Actions"
      >
        <MoreVertical size={18} className="text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
          {onView && (
            <button
              onClick={() => { onView(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Eye size={14} />
              View Details
            </button>
          )}
          {onDeactivate && (
            <button
              onClick={() => { onDeactivate(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Deactivate
            </button>
          )}
        </div>
      )}
    </div>
  );
}
