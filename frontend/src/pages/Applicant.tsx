import { useState } from "react";
import PortalLayout from "../components/layout/PortalLayout";

import ApplicantHeader from "../components/applicant/ApplicantHeader";
import UploadNotice from "../components/applicant/UploadNotice";
import UploadCV from "../components/applicant/UploadCV";
import AIAnalysis from "../components/applicant/AIAnalysis";
import ApplicationStatus from "../components/applicant/ApplicationStatus";
import ApplicationHistory from "../components/applicant/ApplicationHistory";

export default function Applicant() {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  return (
    <PortalLayout applicant>
      <ApplicantHeader />
      <UploadNotice />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <UploadCV />
        </div>
        <AIAnalysis />
      </div>
      <ApplicationStatus applicationId={selectedAppId} />
      <ApplicationHistory selectedId={selectedAppId} onSelect={setSelectedAppId} />
    </PortalLayout>
  );
}
