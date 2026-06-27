import Card from "../ui/Card";
import CandidateRow from "./CandidateRow";
import type { ApplicationResponse } from "@/types/application";
import type { Vacancy } from "@/types/vacancy";

interface CandidateTableProps {
  applications: ApplicationResponse[];
  vacancies: Map<string, Vacancy>;
  loading?: boolean;
}

export default function CandidateTable({ applications, vacancies, loading }: CandidateTableProps) {
  if (loading) {
    return (
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold">Ranking de Postulantes</h2>
          <p className="text-sm text-slate-500 mt-1">Postulantes evaluados por IA, ordenados por puntaje.</p>
        </div>
        <div className="px-6 py-12 text-center text-slate-500">Cargando...</div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-6 py-5 border-b">
        <h2 className="text-xl font-semibold">Ranking de Postulantes</h2>
        <p className="text-sm text-slate-500 mt-1">Postulantes evaluados por IA, ordenados por puntaje.</p>
      </div>

      <table className="w-full">
        <thead className="bg-slate-50">
          <tr className="text-left text-sm text-slate-600">
            <th className="px-6 py-3">Postulante</th>
            <th className="px-6 py-3">Vacante</th>
            <th className="px-6 py-3">Facultad</th>
            <th className="px-6 py-3">Puntaje</th>
            <th className="px-6 py-3">Estado</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => (
            <CandidateRow
              key={app.id}
              application={app}
              vacancy={vacancies.get(app.vacancy_id)}
            />
          ))}
        </tbody>
      </table>

      {applications.length === 0 && (
        <div className="px-6 py-12 text-center text-slate-500">
          No hay postulaciones para este filtro.
        </div>
      )}
    </Card>
  );
}
