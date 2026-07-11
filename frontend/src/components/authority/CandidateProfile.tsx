import { Download, Building2, ShieldCheck } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { getApplicationCVUrl } from "@/services/dashboardService";
import type { ApplicationRankingItem } from "@/services/dashboardService";

interface CandidateProfileProps {
  application: ApplicationRankingItem;
}

export default function CandidateProfile({ application }: CandidateProfileProps) {
  const handleDownloadCV = async () => {
    try {
      const url = await getApplicationCVUrl(application.cv_storage_key);
      window.open(url, "_blank");
    } catch {
      // silently ignore
    }
  };

  const initials = application.applicant_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="p-8 mb-6">
      <div className="flex flex-col xl:flex-row justify-between gap-8">
        <div className="flex gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {application.applicant_name}
            </h1>
            <p className="text-slate-600 mt-2">
              {application.vacancy_title}
            </p>
            <div className="flex flex-wrap gap-5 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-600" />
                {application.status}
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                {application.vacancy_faculty}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center xl:text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Global AI Score
          </p>
          <h2 className="text-6xl font-bold text-sky-500 mt-2">
            {application.score_total ?? "—"}%
          </h2>
          <Button
            variant="danger"
            onClick={handleDownloadCV}
            className="mt-5 flex items-center gap-2"
          >
            <Download size={18} />
            Download CV (PDF)
          </Button>
        </div>
      </div>
    </Card>
  );
}
