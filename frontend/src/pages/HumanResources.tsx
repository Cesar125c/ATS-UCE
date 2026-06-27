import { useState, useEffect, useCallback } from "react";
import MainLayout from "../components/layout/MainLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCards from "../components/dashboard/StatsCards";
import Filters from "../components/dashboard/Filters";
import CandidateTable from "../components/dashboard/CandidateTable";
import Pagination from "../components/dashboard/Pagination";
import ApplicationsChart from "../components/dashboard/ApplicationsChart";
import { getDashboardStats, getApplicationsByStatus } from "@/services/dashboardService";
import { getVacancies } from "@/services/vacancyService";
import type { DashboardStats } from "@/services/dashboardService";
import type { ApplicationResponse } from "@/types/application";
import type { Vacancy } from "@/types/vacancy";

export default function HumanResources() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(4);
  const [vacancyMap, setVacancyMap] = useState<Map<string, Vacancy>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsResult, vacancies] = await Promise.all([
        getApplicationsByStatus(status || undefined, page, pageSize),
        getVacancies(),
      ]);
      setApplications(appsResult.items);
      setTotal(appsResult.total);
      setPageSize(appsResult.page_size);
      setVacancyMap(new Map(vacancies.map((v) => [v.id, v])));
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

  return (
    <MainLayout>
      <DashboardHeader />

      <StatsCards stats={stats} />

      <Filters status={status} onStatusChange={handleStatusChange} />

      <CandidateTable
        applications={applications}
        vacancies={vacancyMap}
        loading={loading}
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
    </MainLayout>
  );
}
