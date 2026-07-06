import { useCallback, useEffect, useState } from "react";
import PortalLayout from "../components/layout/PortalLayout";
import AuthorityHeader from "../components/authority/AuthorityHeader";
import PendingCandidates from "../components/authority/PendingCandidates";
import CandidateProfile from "../components/authority/CandidateProfile";
import AIAnalysisSummary from "../components/authority/AIAnalysisSummary";
import ProcessHistory from "../components/authority/ProcessHistory";
import AuthorityDecisionPanel from "../components/authority/AuthorityDecisionPanel";
import {
  getAllApplications,
  type ApplicationRankingItem,
} from "@/services/dashboardService";

export default function Authorities() {
  const [applications, setApplications] = useState<ApplicationRankingItem[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationRankingItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      const result = await getAllApplications(1, 50);
      const authorityStages = ["DEAN_STAGE", "RECTOR_STAGE", "FINANCE_STAGE"];
      const filtered = result.items.filter((app) =>
        authorityStages.includes(app.status),
      );
      setApplications(filtered);
      setSelectedApp((prev) => (filtered.length > 0 && !prev ? filtered[0] : prev));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleEvaluationSuccess = async () => {
    await fetchApplications();
    setSelectedApp(null);
  };

  return (
    <PortalLayout>
      <AuthorityHeader />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <PendingCandidates
            applications={applications}
            selectedId={selectedApp?.id ?? null}
            onSelect={setSelectedApp}
            loading={loading}
          />
        </div>
        <div className="col-span-8">
          {selectedApp && (
            <>
              <CandidateProfile application={selectedApp} />
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="col-span-2">
                  <AIAnalysisSummary application={selectedApp} />
                </div>
                <ProcessHistory />
              </div>
              <AuthorityDecisionPanel
                applicationId={selectedApp.id}
                onSuccess={handleEvaluationSuccess}
              />
            </>
          )}
          {!selectedApp && !loading && (
            <div className="text-center text-slate-500 mt-20">
              No hay postulaciones pendientes de revisión.
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
