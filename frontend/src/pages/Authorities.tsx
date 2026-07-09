import { useEffect, useMemo, useState } from "react";
import { useApplications } from "@/hooks/useAppQueries";
import type { ApplicationRankingItem } from "@/services/dashboardService";
import AIAnalysisSummary from "../components/authority/AIAnalysisSummary";
import AuthorityDecisionPanel from "../components/authority/AuthorityDecisionPanel";
import AuthorityHeader from "../components/authority/AuthorityHeader";
import CandidateProfile from "../components/authority/CandidateProfile";
import PendingCandidates from "../components/authority/PendingCandidates";
import ProcessHistory from "../components/authority/ProcessHistory";
import PortalLayout from "../components/layout/PortalLayout";

const AUTHORITY_STAGES = ["DEAN_STAGE", "RECTOR_STAGE", "FINANCE_STAGE"];

export default function Authorities() {
  const [selectedApp, setSelectedApp] = useState<ApplicationRankingItem | null>(null);
  const applicationsQuery = useApplications({ page: 1, pageSize: 50 });
  const applications = useMemo(
    () =>
      applicationsQuery.data?.items.filter((app) =>
        AUTHORITY_STAGES.includes(app.status),
      ) ?? [],
    [applicationsQuery.data?.items],
  );

  useEffect(() => {
    setSelectedApp((prev) => {
      if (prev && applications.some((app) => app.id === prev.id)) return prev;
      return applications[0] ?? null;
    });
  }, [applications]);

  const handleEvaluationSuccess = () => {
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
            loading={applicationsQuery.isLoading}
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
          {!selectedApp && !applicationsQuery.isLoading && (
            <div className="text-center text-slate-500 mt-20">
              No hay postulaciones pendientes de revision.
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
