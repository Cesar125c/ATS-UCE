import { apiFetch } from "./api";

export interface DashboardStats {
  total_applicants: number;
  avg_score: number;
  in_progress: number;
  completed: number;
}

export interface ApplicationRankingItem {
  id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  vacancy_title: string;
  vacancy_faculty: string;
  status: string;
  score_total: number | null;
  score_academic: number | null;
  score_experience: number | null;
  score_production: number | null;
  score_profile_match: number | null;
  score_languages: number | null;
  evaluation_summary: string | null;
  cv_storage_key: string;
  submitted_at: string;
}

export interface ApplicationListResponse {
  items: ApplicationRankingItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
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

export async function getApplicationCVUrl(storageKey: string): Promise<string> {
  const data = await apiFetch<{ url: string }>(
    `/api/v1/applications/cv-presigned/${encodeURIComponent(storageKey)}`,
  );
  return data.url;
}
