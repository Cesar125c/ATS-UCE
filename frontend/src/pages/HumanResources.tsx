import { useState } from "react";
import { useApplications, useDashboardStats } from "@/hooks/useAppQueries";
import { useDebounce } from "@/hooks/useDebounce";
import ApplicationsChart from "../components/dashboard/ApplicationsChart";
import CandidateTable from "../components/dashboard/CandidateTable";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import EvaluationModal from "../components/dashboard/EvaluationModal";
import Filters from "../components/dashboard/Filters";
import Pagination from "../components/dashboard/Pagination";
import StatsCards from "../components/dashboard/StatsCards";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function HumanResources() {
  const [status, setStatus] = useState("HR_STAGE");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [evaluatingAppId, setEvaluatingAppId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const statsQuery = useDashboardStats();
  const applicationsQuery = useApplications({
    status: status || undefined,
    page,
    pageSize,
    search: debouncedSearch || undefined,
  });
  const applications = applicationsQuery.data;

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleEvaluationSuccess = () => {
    setEvaluatingAppId(null);
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <StatsCards stats={statsQuery.data ?? null} />

      <Filters status={status} onStatusChange={handleStatusChange} search={search} onSearchChange={(s) => { setSearch(s); setPage(1); }} />

      <CandidateTable
        items={applications?.items ?? []}
        loading={applicationsQuery.isLoading}
        onEvaluate={setEvaluatingAppId}
      />

      {applicationsQuery.isError && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Error loading dashboard data.
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={applications?.pages ?? 1}
        totalItems={applications?.total ?? 0}
        pageSize={applications?.page_size ?? pageSize}
        onPageChange={setPage}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <ApplicationsChart />
      </div>

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
