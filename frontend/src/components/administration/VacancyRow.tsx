import VacancyStatus from "./VacancyStatus";
import VacancyActions from "./VacancyActions";
import type { Vacancy } from "@/types/vacancy";

interface VacancyRowProps {
  vacancy: Vacancy;
}

export default function VacancyRow({ vacancy }: VacancyRowProps) {
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
        <VacancyActions />
      </td>
    </tr>
  );
}
