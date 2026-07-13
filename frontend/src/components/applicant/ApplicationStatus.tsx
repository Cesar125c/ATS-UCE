import { CheckCircle2, Circle, Clock3, Eye, Loader2, XCircle } from "lucide-react";
import { useMyApplications } from "@/hooks/useAppQueries";
import type { FlowStatus, StatusHistoryDTO } from "@/types/application";
import Card from "../ui/Card";
import ScoreBreakdown from "./ScoreBreakdown";

const STEP_ORDER: FlowStatus[] = [
  "RECEIVED",
  "PROCESSING_AI",
  "HR_STAGE",
  "DEAN_STAGE",
  "RECTOR_STAGE",
  "FINANCE_STAGE",
  "HIRED",
];

const STEP_LABELS: Record<FlowStatus, string> = {
  RECEIVED: "Received",
  PROCESSING_AI: "AI Validation",
  HR_STAGE: "HR Review",
  DEAN_STAGE: "Dean",
  RECTOR_STAGE: "Rector",
  FINANCE_STAGE: "Finance",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

const STATUS_MESSAGE: Record<string, { title: string; detail: string }> = {
  RECEIVED: {
    title: "Your application has been received.",
    detail: "We received your CV successfully. The AI analysis will begin shortly.",
  },
  PROCESSING_AI: {
    title: "Analyzing your CV with AI...",
    detail:
      "The system is evaluating your profile automatically. This process may take a few minutes.",
  },
  HR_STAGE: {
    title: "Your application is under HR Review.",
    detail:
      "We are verifying the validity of your certificates. You will receive an email with updates within the next 48 hours.",
  },
  DEAN_STAGE: {
    title: "Your application is under review by the Dean.",
    detail: "The academic authority is evaluating your profile for the vacancy.",
  },
  RECTOR_STAGE: {
    title: "Your application is under review by the Rector.",
    detail: "The highest authority is reviewing your application.",
  },
  FINANCE_STAGE: {
    title: "Your application is under Finance review.",
    detail: "The finance department is validating budget availability.",
  },
  HIRED: {
    title: "Congratulations, you have been hired.",
    detail: "Your application was approved. You will receive an email with the next steps.",
  },
  REJECTED: {
    title: "Your application has not been selected.",
    detail:
      "Unfortunately your profile was not selected this time. You can apply to other available vacancies.",
  },
};

const TERMINAL_STATUSES: FlowStatus[] = ["HIRED", "REJECTED"];

function computeStepStatus(
  flowStep: FlowStatus,
  historyStatuses: Set<string>,
  currentStatus: FlowStatus,
): "completed" | "current" | "pending" {
  if (historyStatuses.has(flowStep)) {
    return flowStep === currentStatus ? "current" : "completed";
  }
  return "pending";
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function getStepDate(
  flowStep: FlowStatus,
  history: StatusHistoryDTO[],
): string {
  const entry = history.find((h) => h.status === flowStep);
  return entry ? formatDate(entry.transitioned_at) : "--";
}

export default function ApplicationStatus({ applicationId }: { applicationId?: string | null }) {
  const {
    data: applications,
    isLoading,
    isError,
  } = useMyApplications(true);

  if (isLoading) {
    return (
      <Card className="p-6 mt-6 text-center text-slate-500">
        Loading application status...
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 mt-6 text-center text-red-600">
        Failed to load the application status.
      </Card>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card className="p-6 mt-6 text-center text-slate-500">
        You have no registered applications. Upload your CV to get started.
      </Card>
    );
  }

  const currentApp = applicationId
    ? applications.find((app) => app.id === applicationId)
    : applications[0];

  if (!currentApp) {
    return (
      <Card className="p-6 mt-6 text-center text-slate-500">
        Click an application from the history below to see its status.
      </Card>
    );
  }
  const history = currentApp.status_history || [];
  const historyStatuses = new Set(history.map((h) => h.status));
  const currentStatus = currentApp.status;
  const message = STATUS_MESSAGE[currentStatus] ?? {
    title: "Unknown status",
    detail: "",
  };
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
  const isProcessingAI = currentStatus === "PROCESSING_AI";

  return (
    <Card className="p-6 mt-6 border border-slate-200 shadow-none">
      <div className="mb-8">
        <div>
          <h2 className="text-xl font-semibold">
            Your Application Status
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of the selection process.
          </p>
          {isProcessingAI && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              Updating automatically
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-10">
        {STEP_ORDER.map((step, index) => {
          const stepStatus = computeStepStatus(step, historyStatuses, currentStatus);
          const isLastInOrder = index === STEP_ORDER.length - 1;
          const connectorColor =
            stepStatus === "completed" ? "bg-sky-500" : "bg-slate-200";
          const isCurrentProcessingAI =
            stepStatus === "current" && step === "PROCESSING_AI";

          return (
            <div
              key={step}
              className="flex-1 flex flex-col items-center relative"
            >
              {!isLastInOrder && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-[2px] ${connectorColor}`}
                />
              )}

              <div className="relative z-10">
                {stepStatus === "completed" && (
                  <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                    <CheckCircle2 size={18} />
                  </div>
                )}

                {isCurrentProcessingAI && (
                  <div className="w-10 h-10 rounded-full border-4 border-amber-500 bg-white flex items-center justify-center">
                    <Loader2 size={18} className="text-amber-500 animate-spin" />
                  </div>
                )}

                {stepStatus === "current" && !isCurrentProcessingAI && (
                  <div className="w-10 h-10 rounded-full border-4 border-sky-500 bg-white flex items-center justify-center">
                    <Clock3 size={18} className="text-sky-500" />
                  </div>
                )}

                {stepStatus === "pending" && (
                  <div className="w-10 h-10 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center">
                    <Circle size={14} className="text-slate-300" />
                  </div>
                )}
              </div>

              <p className="font-medium text-sm mt-3">{STEP_LABELS[step]}</p>
              <p className="text-xs text-slate-500">
                {isCurrentProcessingAI ? "In progress..." : getStepDate(step, history)}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className={`rounded-lg p-4 flex gap-3 ${
          currentStatus === "REJECTED"
            ? "bg-red-50 border border-red-200"
            : currentStatus === "HIRED"
              ? "bg-emerald-50 border border-emerald-200"
              : isProcessingAI
                ? "bg-amber-50 border border-amber-200"
                : "bg-sky-50 border border-sky-200"
        }`}
      >
        {isProcessingAI ? (
          <Loader2 className="text-amber-500 mt-1 shrink-0 animate-spin" size={18} />
        ) : currentStatus === "REJECTED" ? (
          <XCircle className="text-red-500 mt-1 shrink-0" size={18} />
        ) : currentStatus === "HIRED" ? (
          <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
        ) : (
          <Eye className="text-sky-500 mt-1 shrink-0" size={18} />
        )}

        <div>
          <h4 className="font-semibold">{message.title}</h4>
          <p className="text-sm text-slate-600 mt-1">{message.detail}</p>

          {currentStatus === "REJECTED" && currentApp.error_reason && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-sm font-medium text-red-800">
                Reason: {currentApp.error_reason}
              </p>
            </div>
          )}

          {isTerminal && currentStatus === "HIRED" && (
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">
                Final result: {currentApp.ai_score?.grade ?? "--"}
              </p>
              {currentApp.ai_score && (
                <p className="text-xs text-emerald-700 mt-1">
                  Total score: {currentApp.ai_score.total}/100
                </p>
              )}
            </div>
          )}

          {isTerminal && currentStatus === "REJECTED" && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-sm font-medium text-red-800">
                You can apply to other available vacancies from the CV upload section.
              </p>
            </div>
          )}
        </div>
      </div>

      {currentApp.ai_score && (
        <div className="mt-6">
          <ScoreBreakdown score={currentApp.ai_score} />
        </div>
      )}
    </Card>
  );
}
