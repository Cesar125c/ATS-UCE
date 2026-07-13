import { useMemo } from "react";
import Card from "../ui/Card";
import VacancyRow from "./VacancyRow";
import { useVacancies } from "@/hooks/useAppQueries";

interface VacancyTableProps {
  refreshKey?: number;
  onRefresh?: () => void;
  search?: string;
}

export default function VacancyTable({ onRefresh, search = "" }: VacancyTableProps) {
  const { data: vacancies = [], isLoading: loading } = useVacancies();

  const filtered = useMemo(
    () => {
      if (!search) return vacancies;
      const q = search.toLowerCase();
      return vacancies.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.faculty.toLowerCase().includes(q),
      );
    },
    [vacancies, search],
  );

  if (loading && vacancies.length === 0) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="px-6 py-12 text-center text-slate-500">Loading vacancies...</div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto overscroll-x-contain table-scroll" tabIndex={0} aria-label="Vacancies table">
      <table className="w-full min-w-[760px]">
        <thead className="bg-slate-50 border-b">
          <tr className="text-left text-sm text-slate-600">
            <th className="px-6 py-4 font-semibold">ID</th>
            <th className="px-6 py-4 font-semibold">Position Title</th>
            <th className="px-6 py-4 font-semibold">Faculty</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vacancies.length === 0 && !search ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                No vacancies registered. Create the first one using the "New Vacancy" button.
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                No vacancies found for "{search}".
              </td>
            </tr>
          ) : (
            filtered.map((v) => <VacancyRow key={v.id} vacancy={v} onDeleted={onRefresh} />)
          )}
        </tbody>
      </table>
      </div>
    </Card>
  );
}
