import { useSearchParams } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";

import ApplicantHeader from "../components/applicant/ApplicantHeader";
import ApplicantStats from "../components/applicant/ApplicantStats";
import UploadNotice from "../components/applicant/UploadNotice";
import UploadCV from "../components/applicant/UploadCV";
import AIAnalysis from "../components/applicant/AIAnalysis";
import ApplicationStatus from "../components/applicant/ApplicationStatus";
import ApplicationHistory from "../components/applicant/ApplicationHistory";
import HelpCards from "../components/applicant/HelpCards";

export default function Applicant() {
  const [searchParams] = useSearchParams();
  const vacancyId = searchParams.get("vacancyId") || "";

  return (
    <MainLayout>

      <ApplicantHeader />

      <ApplicantStats />

      <UploadNotice />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <div className="xl:col-span-2">
          {vacancyId ? (
            <UploadCV vacancyId={vacancyId} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 h-full flex items-center justify-center text-center">
              <p className="text-slate-500">
                Selecciona una vacante para postular desde el listado de vacantes disponibles.
              </p>
            </div>
          )}
        </div>

        <AIAnalysis />

      </div>

      <ApplicationStatus />

      <ApplicationHistory />

      <HelpCards />

    </MainLayout>
  );
}