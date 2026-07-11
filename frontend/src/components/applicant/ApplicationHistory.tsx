import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { useMyApplications, useVacancies } from "@/hooks/useAppQueries";
import type { FlowStatus } from "@/types/application";
import type { Vacancy } from "@/types/vacancy";

const STATUS_LABEL: Record<FlowStatus, string> = {
  RECEIVED: "Received",
  PROCESSING_AI: "AI Analysis",
  HR_STAGE: "HR Review",
  DEAN_STAGE: "Dean",
  RECTOR_STAGE: "Rector",
  FINANCE_STAGE: "Finance",
  HIRED: "Hired",
  REJECTED: "Rejected",
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
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ApplicationHistoryProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ApplicationHistory({ selectedId, onSelect }: ApplicationHistoryProps) {
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
        Loading history...
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
        You have no registered applications. Upload your CV to get started.
      </Card>
    );
  }

  return (
    <Card className="p-6 mt-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Application History</h2>
        <span className="text-sm text-slate-500">
          {applications.length} application{applications.length !== 1 ? "s" : ""}
        </span>
      </div>

      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="py-3">Vacancy</th>
            <th>Date</th>
            <th>Status</th>
            <th>AI Score</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => {
            const vacancy = vacancyMap.get(app.vacancy_id);
            const status = app.status as FlowStatus;
            const isSelected = app.id === selectedId;

            return (
              <tr
                key={app.id}
                className={`border-b cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-sky-50 border-l-4 border-l-sky-500"
                    : "hover:bg-slate-50 border-l-4 border-l-transparent"
                }`}
                onClick={() => onSelect(app.id)}
              >
                <td className="py-4 pl-3">
                  <p className="font-medium">
                    {vacancy?.title ?? "Vacancy"}
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
