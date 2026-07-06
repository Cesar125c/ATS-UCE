import { useState } from "react";
import { Trash2 } from "lucide-react";
import VacancyStatus from "./VacancyStatus";
import { deleteVacancy } from "@/services/vacancyService";
import type { Vacancy } from "@/types/vacancy";

interface VacancyRowProps {
  vacancy: Vacancy;
  onDeleted: () => void;
}

export default function VacancyRow({ vacancy, onDeleted }: VacancyRowProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Deactivate vacancy "${vacancy.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteVacancy(vacancy.id);
      onDeleted();
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr className="border-b hover:bg-slate-50 transition-colors">
      <td className="px-6 py-5 font-medium text-slate-700 font-mono text-xs">
        {vacancy.id.slice(0, 8)}
      </td>
      <td className="px-6 py-5">
        <h3 className="font-medium text-slate-800">{vacancy.title}</h3>
        <p className="text-xs text-slate-500">{vacancy.department}</p>
      </td>
      <td className="px-6 py-5 text-slate-700">{vacancy.faculty}</td>
      <td className="px-6 py-5">
        <VacancyStatus status={vacancy.is_active ? "Activa" : "Cerrada"} />
      </td>
      <td className="px-6 py-5 text-right">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
          title="Deactivate vacancy"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
