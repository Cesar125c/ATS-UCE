import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { useMyApplications, useVacancies } from "@/hooks/useAppQueries";
import type { FlowStatus } from "@/types/application";
import type { Vacancy } from "@/types/vacancy";

const STATUS_LABEL: Record<FlowStatus, string> = {
  RECEIVED: "Recibido",
  PROCESSING_AI: "Analizando IA",
  HR_STAGE: "Revisión RRHH",
  DEAN_STAGE: "Decano",
  RECTOR_STAGE: "Rector",
  FINANCE_STAGE: "Financiero",
  HIRED: "Seleccionado",
  REJECTED: "Rechazado",
};

const STATUS_VARIANT: Record<FlowStatus, "default" | "cyan" | "blue" | "green" | "red" | "yellow"> = {
  RECEIVED: "blue",
  PROCESSING_AI: "yellow",
  HR_STAGE: "cyan",
  DEAN_STAGE: "cyan",
  RECTOR_STAGE: "cyan",
  FINANCE_STAGE: "cyan",
  HIRED: "green",
  REJECTED: "red",
};

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ApplicationHistory() {
  const {
    data: applications = [],
    isLoading: applicationsLoading,
    isError: applicationsError,
  } = useMyApplications();
  const {
    data: vacancies = [],
    isLoading: vacanciesLoading,
    isError: vacanciesError,
  } = useVacancies();
  const vacancyMap = new Map<string, Vacancy>(vacancies.map((v) => [v.id, v]));
  const loading = applicationsLoading || vacanciesLoading;
  const error = applicationsError || vacanciesError;

  if (loading) {
    return (
      <Card className="p-6 mt-6 text-center text-slate-500">
        Cargando historial...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 mt-6 text-center text-red-600">{error}</Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="p-6 mt-6 text-center text-slate-500">
        No tienes postulaciones registradas. Sube tu CV para comenzar.
      </Card>
    );
  }

  return (
    <Card className="p-6 mt-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Historial de Postulaciones</h2>
        <span className="text-sm text-slate-500">
          {applications.length} postulación{applications.length !== 1 ? "es" : ""}
        </span>
      </div>

      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="py-3">Vacante</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Score IA</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => {
            const vacancy = vacancyMap.get(app.vacancy_id);
            const status = app.status as FlowStatus;

            return (
              <tr key={app.id} className="border-b hover:bg-slate-50">
                <td className="py-4">
                  <p className="font-medium">
                    {vacancy?.title ?? "Vacante"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {vacancy?.faculty ?? ""}
                  </p>
                </td>

                <td>{formatDate(app.created_at)}</td>

                <td>
                  <Badge
                    variant={STATUS_VARIANT[status] ?? "default"}
                    size="sm"
                  >
                    {STATUS_LABEL[status] ?? status}
                  </Badge>
                </td>

                <td className="font-semibold">
                  {app.ai_score ? `${Math.round(app.ai_score.total)}%` : "—"}
                </td>

                <td className="text-right">
                  <span className="text-xs text-slate-400 font-mono">
                    {app.id.slice(0, 8)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
