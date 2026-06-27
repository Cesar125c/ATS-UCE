import { apiFetch } from "./api";
import type { ApplicationResponse } from "@/types/application";

export interface DashboardStats {
  total_applicants: number;
  avg_score: number;
  in_progress: number;
  completed: number;
}

export interface ApplicationListResponse {
  items: ApplicationResponse[];
  total: number;
  page: number;
  page_size: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/v1/dashboard/stats");
}

export async function getApplicationsByStatus(
  status: string | undefined,
  page: number,
  pageSize: number,
): Promise<ApplicationListResponse> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  return apiFetch<ApplicationListResponse>(`/api/v1/applications?${params}`);
}
