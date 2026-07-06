import { Download } from "lucide-react";
import Button from "../ui/Button";

export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-8">

      {/* Left */}
      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Human Resources Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Ranking of candidates, AI analysis, recruitment monitoring and hiring statistics.
        </p>

      </div>

      {/* Right */}
      <Button
        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-5 py-3 rounded-lg shadow-sm"
      >
        <Download size={18} />

        Export Report

      </Button>

    </div>
  );
}