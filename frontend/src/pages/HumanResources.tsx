import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCards from "../components/dashboard/StatsCards";
import Filters from "../components/dashboard/Filters";
import CandidateTable from "../components/dashboard/CandidateTable";
import Pagination from "../components/dashboard/Pagination";
import ApplicationsChart from "../components/dashboard/ApplicationsChart";
import EvaluationModal from "../components/dashboard/EvaluationModal";
import { getDashboardStats, getApplicationsByStatus } from "@/services/dashboardService";
import { getVacancies } from "@/services/vacancyService";
import type { DashboardStats, ApplicationRankingItem } from "@/services/dashboardService";
import type { Vacancy } from "@/types/vacancy";

export default function HumanResources() {
  const [status, setStatus] = useState("HR_STAGE");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [items, setItems] = useState<ApplicationRankingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluatingAppId, setEvaluatingAppId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApplicationsByStatus(status || undefined, page, pageSize);
      setItems(result.items);
      setTotal(result.total);
      setPageSize(result.page_size);
      setTotalPages(result.pages);
    } catch {
      setError("Error al cargar los datos del dashboard.");
    } finally {
      setLoading(false);
    }
  }, [status, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        if (!cancelled) setStats(data);
      } catch {
        // stats failure is non-blocking
      }
    }
    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleEvaluationSuccess = () => {
    setEvaluatingAppId(null);
    fetchData();
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <StatsCards stats={stats} />

      <Filters status={status} onStatusChange={handleStatusChange} />

      <CandidateTable
        items={items}
        loading={loading}
        onEvaluate={setEvaluatingAppId}
      />

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
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
