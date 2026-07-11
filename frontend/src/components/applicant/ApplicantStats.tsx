import {
  Briefcase,
  ClipboardCheck,
  BrainCircuit,
} from "lucide-react";
import Card from "../ui/Card";
import { useMyApplications } from "@/hooks/useAppQueries";

function getStageLabel(status: string): string {
  const labels: Record<string, string> = {
    RECEIVED: "Received",
    PROCESSING_AI: "AI Analysis",
    HR_STAGE: "HR Review",
    DEAN_STAGE: "Dean Review",
    RECTOR_STAGE: "Rector Review",
    FINANCE_STAGE: "Finance Approval",
    HIRED: "Selected",
    REJECTED: "Rejected",
  };
  return labels[status] ?? status;
}

export default function ApplicantStats() {
  const { data: applications } = useMyApplications();

  if (!applications || applications.length === 0) {
    return null;
  }

  const activeApps = applications.filter(
    (app) => app.status !== "HIRED" && app.status !== "REJECTED",
  );

  const latestApp = activeApps.length > 0
    ? activeApps[activeApps.length - 1]
    : applications[applications.length - 1];

  const scores = applications
    .filter((app) => app.ai_score?.total != null)
    .map((app) => app.ai_score!.total);

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  const stats = [
    {
      title: "Active Applications",
      value: String(activeApps.length).padStart(2, "0"),
      subtitle: "",
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Current Stage",
      value: getStageLabel(latestApp.status),
      subtitle: "",
      icon: ClipboardCheck,
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Average AI Score",
      value: avgScore !== null ? `${avgScore}/100` : "N/A",
      subtitle: "",
      icon: BrainCircuit,
      color: "bg-sky-100 text-sky-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
              {stat.subtitle && (
                <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <Icon size={22} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
