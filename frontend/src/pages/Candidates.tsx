import { useState } from "react";
import { useApplications } from "@/hooks/useAppQueries";
import CandidateTable from "../components/dashboard/CandidateTable";
import EvaluationModal from "../components/dashboard/EvaluationModal";
import Filters from "../components/dashboard/Filters";
import Pagination from "../components/dashboard/Pagination";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function Candidates() {
  const [status, setStatus] = useState("HR_STAGE");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [evaluatingAppId, setEvaluatingAppId] = useState<string | null>(null);
  const applicationsQuery = useApplications({
    status: status || undefined,
    page,
    pageSize,
  });
  const applications = applicationsQuery.data;

  const handleEvaluationSuccess = () => {
    setEvaluatingAppId(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Candidatos</h1>
        <p className="text-slate-500 mt-2">
          Revisa, filtra y evalua las postulaciones por estado del proceso.
        </p>
      </div>

      <Filters
        status={status}
        onStatusChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
      />

      <CandidateTable
        items={applications?.items ?? []}
        loading={applicationsQuery.isLoading}
        onEvaluate={setEvaluatingAppId}
      />

      {applicationsQuery.isError && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Error al cargar los candidatos.
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={applications?.pages ?? 1}
        totalItems={applications?.total ?? 0}
        pageSize={applications?.page_size ?? pageSize}
        onPageChange={setPage}
      />

      {evaluatingAppId && (
        <EvaluationModal
          applicationId={evaluatingAppId}
          onClose={() => setEvaluatingAppId(null)}
          onSuccess={handleEvaluationSuccess}
        />
      )}
    </DashboardLayout>
  );
}
