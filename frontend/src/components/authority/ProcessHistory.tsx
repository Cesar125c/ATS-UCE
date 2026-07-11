import {
  CheckCircle2,
  Clock3,
  Circle,
} from "lucide-react";
import Card from "../ui/Card";
import { useApplicationHistory } from "@/hooks/useAppQueries";
import type { StatusHistoryDTO } from "@/types/application";

const FLOW_ORDER = [
  "RECEIVED",
  "PROCESSING_AI",
  "HR_STAGE",
  "DEAN_STAGE",
  "RECTOR_STAGE",
  "FINANCE_STAGE",
];

function getStepTitle(status: string): string {
  const labels: Record<string, string> = {
    RECEIVED: "Application Received",
    PROCESSING_AI: "AI Analysis",
    HR_STAGE: "HR Validation",
    DEAN_STAGE: "Dean Review",
    RECTOR_STAGE: "Rector Review",
    FINANCE_STAGE: "Finance Approval",
    HIRED: "Selected",
    REJECTED: "Rejected",
  };
  return labels[status] ?? status;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildSteps(history: StatusHistoryDTO[], currentStatus: string) {
  const currentIndex = FLOW_ORDER.indexOf(currentStatus);

  if (currentStatus === "REJECTED" || currentStatus === "HIRED") {
    return FLOW_ORDER.map((s) => {
      const entry = history.find((h) => h.status === s);
      return {
        title: getStepTitle(s),
        date: entry ? `Completed · ${formatDate(entry.transitioned_at)}` : "",
        status: "completed" as const,
      };
    });
  }

  return FLOW_ORDER.map((s, i) => {
    const entry = history.find((h) => h.status === s);
    if (entry) {
      return {
        title: getStepTitle(s),
        date: `Completed · ${formatDate(entry.transitioned_at)}`,
        status: "completed" as const,
      };
    }
    if (i === currentIndex || (currentIndex === -1 && i === FLOW_ORDER.length - 1)) {
      return {
        title: getStepTitle(s),
        date: "In progress",
        status: "current" as const,
      };
    }
    return {
      title: getStepTitle(s),
      date: "Pending",
      status: "pending" as const,
    };
  });
}

export default function ProcessHistory({
  applicationId,
  currentStatus,
}: {
  applicationId?: string;
  currentStatus?: string;
}) {
  const { data: history } = useApplicationHistory(applicationId);

  const steps = history && currentStatus
    ? buildSteps(history, currentStatus)
    : [];

  return (
    <Card className="p-6 h-full">
      <h2 className="text-xl font-semibold mb-6">Process History</h2>
      {steps.length === 0 ? (
        <p className="text-sm text-slate-400">No history available.</p>
      ) : (
        <div className="space-y-6">
          {steps.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div>
                {item.status === "completed" && (
                  <CheckCircle2 size={18} className="text-green-500" />
                )}
                {item.status === "current" && (
                  <Clock3 size={18} className="text-sky-500" />
                )}
                {item.status === "pending" && (
                  <Circle size={18} className="text-slate-300" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
