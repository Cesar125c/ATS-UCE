import { useState, useEffect } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { getMyApplicationStatus } from "@/services/applicationService";
import { getVacancies } from "@/services/vacancyService";
import type { ApplicationResponse, FlowStatus } from "@/types/application";
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
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [vacancyMap, setVacancyMap] = useState<Map<string, Vacancy>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [apps, vacancies] = await Promise.all([
          getMyApplicationStatus(),
          getVacancies(),
        ]);
        if (cancelled) return;
        setApplications(apps);
        setVacancyMap(new Map(vacancies.map((v) => [v.id, v])));
        setError(null);
      } catch {
        if (!cancelled) {
          setError("Error al cargar el historial de postulaciones.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
