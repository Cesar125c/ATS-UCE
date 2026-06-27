import MainLayout from "../components/layout/MainLayout";

import AuthorityHeader from "../components/authority/AuthorityHeader";
import PendingCandidates from "../components/authority/PendingCandidates";
import CandidateProfile from "../components/authority/CandidateProfile";
import AIAnalysisSummary from "../components/authority/AIAnalysisSummary";
import ProcessHistory from "../components/authority/ProcessHistory";
import DecisionForm from "../components/authority/DecisionForm";
import DecisionActions from "../components/authority/DecisionActions";

export default function Authorities() {
  return (
    <MainLayout>

      <AuthorityHeader />

      <div className="grid grid-cols-12 gap-6">

        {/* Left Panel */}

        <div className="col-span-4">

          <PendingCandidates />

        </div>

        {/* Right Panel */}

        <div className="col-span-8">

          <CandidateProfile />

          <div className="grid grid-cols-3 gap-6 mb-6">

            <div className="col-span-2">

              <AIAnalysisSummary />

            </div>

            <ProcessHistory />

          </div>

          <div className="grid grid-cols-3 gap-6">

            <div className="col-span-2">

              <DecisionForm />

            </div>

            <DecisionActions />

          </div>

        </div>

      </div>

    </MainLayout>
  );
}