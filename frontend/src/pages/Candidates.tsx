import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Filters from "../components/dashboard/Filters";
import CandidateTable from "../components/dashboard/CandidateTable";
import Pagination from "../components/dashboard/Pagination";
import EvaluationModal from "../components/dashboard/EvaluationModal";
import { getApplicationsByStatus } from "@/services/dashboardService";
import type { ApplicationRankingItem } from "@/services/dashboardService";

export default function Candidates() {
  const [status, setStatus] = useState("HR_STAGE");
  const [page, setPage] = useState(1);
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
      setError("Error al cargar los candidatos.");
    } finally {
      setLoading(false);
    }
  }, [status, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEvaluationSuccess = () => {
    setEvaluatingAppId(null);
    fetchData();
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Candidatos</h1>
        <p className="text-slate-500 mt-2">
          Revisa, filtra y evalúa las postulaciones por estado del proceso.
        </p>
      </div>

      <Filters status={status} onStatusChange={(s) => { setStatus(s); setPage(1); }} />

      <CandidateTable items={items} loading={loading} onEvaluate={setEvaluatingAppId} />

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
