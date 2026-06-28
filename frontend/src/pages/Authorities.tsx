import PortalLayout from "../components/layout/PortalLayout";
import AuthorityHeader from "../components/authority/AuthorityHeader";
import PendingCandidates from "../components/authority/PendingCandidates";
import CandidateProfile from "../components/authority/CandidateProfile";
import AIAnalysisSummary from "../components/authority/AIAnalysisSummary";
import ProcessHistory from "../components/authority/ProcessHistory";
import DecisionForm from "../components/authority/DecisionForm";
import DecisionActions from "../components/authority/DecisionActions";
import AuthorityDecisionPanel from "../components/authority/AuthorityDecisionPanel";

export default function Authorities() {
  return (
    <PortalLayout>
      <AuthorityHeader />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <PendingCandidates />
        </div>
        <div className="col-span-8">
          <CandidateProfile />
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2">
              <AIAnalysisSummary />
            </div>
            <ProcessHistory />
          </div>
          <AuthorityDecisionPanel />
        </div>
      </div>
    </PortalLayout>
  );
}
