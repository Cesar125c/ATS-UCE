import Card from "../ui/Card";
import VacancyRow from "./VacancyRow";
import { useVacancies } from "@/hooks/useAppQueries";

interface VacancyTableProps {
  refreshKey?: number;
  onRefresh?: () => void;
}

export default function VacancyTable({ onRefresh }: VacancyTableProps) {
  const { data: vacancies = [], isLoading: loading } = useVacancies();

  if (loading && vacancies.length === 0) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="px-6 py-12 text-center text-slate-500">Cargando vacantes...</div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full">
        <thead className="bg-slate-50 border-b">
          <tr className="text-left text-sm text-slate-600">
            <th className="px-6 py-4 font-semibold">ID</th>
            <th className="px-6 py-4 font-semibold">Título del Cargo</th>
            <th className="px-6 py-4 font-semibold">Facultad</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vacancies.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                No hay vacantes registradas. Crea la primera usando el botón "Nueva Vacante".
              </td>
            </tr>
          ) : (
            vacancies.map((v) => <VacancyRow key={v.id} vacancy={v} onDeleted={onRefresh} />)
          )}
        </tbody>
      </table>
    </Card>
  );
}
