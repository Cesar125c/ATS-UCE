import { z } from "zod";
import { apiFetch } from "./api";
import {
  DashboardStatsSchema,
  ApplicationListResponseSchema,
  ApplicationRankingItemSchema,
  PresignedUrlSchema,
} from "@/schemas/api";

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type ApplicationRankingItem = z.infer<typeof ApplicationRankingItemSchema>;
export type ApplicationListResponse = z.infer<typeof ApplicationListResponseSchema>;

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/v1/dashboard/stats", undefined, DashboardStatsSchema);
}

export async function getApplications(filters: {
  status?: string;
  page: number;
  pageSize: number;
  search?: string;
}): Promise<ApplicationListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  params.set("page", String(filters.page));
  params.set("page_size", String(filters.pageSize));
  return apiFetch<ApplicationListResponse>(
    `/api/v1/applications/?${params}`,
    undefined,
    ApplicationListResponseSchema,
  );
}

export async function getApplicationCVUrl(storageKey: string): Promise<string> {
  const data = await apiFetch<{ url: string }>(
    `/api/v1/applications/cv-presigned/${encodeURIComponent(storageKey)}`,
    undefined,
    PresignedUrlSchema,
  );
  return data.url;
}
