import MainLayout from "../components/layout/MainLayout";

import AuthorityHeader from "../components/authority/AuthorityHeader";
import PendingCandidates from "../components/authority/PendingCandidates";

export default function Authorities() {
  return (
    <MainLayout>

      <AuthorityHeader />

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-4">

          <PendingCandidates />

        </div>

        <div className="col-span-8">

        </div>

      </div>

    </MainLayout>
  );
}