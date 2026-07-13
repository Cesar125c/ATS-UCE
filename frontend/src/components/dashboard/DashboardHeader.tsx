import { Download } from "lucide-react";
import Button from "../ui/Button";

function exportStatsToCSV() {
  fetch("/api/v1/dashboard/stats")
    .then((res) => res.json())
    .then((stats) => {
      const rows = [
        ["Metric", "Value"],
        ["Total Applications", stats.total_applications ?? 0],
        ["Pending Review", stats.pending_review ?? 0],
        ["Approved", stats.approved ?? 0],
        ["Rejected", stats.rejected ?? 0],
        ["Processing AI", stats.processing_ai ?? 0],
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `ats-report-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(() => {
      // silently ignore — user is already authenticated, failure is transient
    });
}

export default function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">

      {/* Left */}
      <div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Human Resources Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Ranking of candidates, AI analysis, recruitment monitoring and hiring statistics.
        </p>

      </div>

      {/* Right */}
      <Button
        variant="danger"
        className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 rounded-lg shadow-sm"
        onClick={exportStatsToCSV}
      >
        <Download size={18} />
        Export Report
      </Button>

    </div>
  );
}
