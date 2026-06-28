import { useState, useEffect } from "react";
import Card from "../ui/Card";
import VacancyRow from "./VacancyRow";
import { getVacancies } from "@/services/vacancyService";
import type { Vacancy } from "@/types/vacancy";

interface VacancyTableProps {
  refreshKey: number;
}

export default function VacancyTable({ refreshKey }: VacancyTableProps) {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await getVacancies();
        if (!cancelled) setVacancies(data);
      } catch {
        // keep existing data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

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
            vacancies.map((v) => <VacancyRow key={v.id} vacancy={v} />)
          )}
        </tbody>
      </table>
    </Card>
  );
}
