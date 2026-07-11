import { z } from "zod";

export const FlowStatusSchema = z.enum([
  "RECEIVED",
  "PROCESSING_AI",
  "HR_STAGE",
  "DEAN_STAGE",
  "RECTOR_STAGE",
  "FINANCE_STAGE",
  "HIRED",
  "REJECTED",
]);

export const AIScoreSchema = z.object({
  total: z.number(),
  academic_training: z.number(),
  experience: z.number(),
  publications: z.number(),
  profile_match: z.number(),
  languages_competencies: z.number(),
  evaluation_summary: z.string(),
  grade: z.string(),
});

export const StatusHistorySchema = z.object({
  status: FlowStatusSchema,
  transitioned_at: z.string(),
});

export const ApplicationResponseSchema = z.object({
  id: z.string(),
  applicant_id: z.string(),
  vacancy_id: z.string(),
  vacancy_title: z.string().optional(),
  vacancy_faculty: z.string().optional(),
  status: FlowStatusSchema,
  ai_score: AIScoreSchema.nullable(),
  error_reason: z.string().nullable().optional(),
  status_history: z.array(StatusHistorySchema),
  submitted_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ApplicationRankingItemSchema = z.object({
  id: z.string(),
  applicant_id: z.string(),
  applicant_name: z.string(),
  applicant_email: z.string(),
  vacancy_title: z.string(),
  vacancy_faculty: z.string(),
  status: z.string(),
  score_total: z.number().nullable(),
  score_academic: z.number().nullable(),
  score_experience: z.number().nullable(),
  score_production: z.number().nullable(),
  score_profile_match: z.number().nullable(),
  score_languages: z.number().nullable(),
  evaluation_summary: z.string().nullable(),
  cv_storage_key: z.string(),
  submitted_at: z.string(),
});

export const ApplicationListResponseSchema = z.object({
  items: z.array(ApplicationRankingItemSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
  pages: z.number(),
});

export const DashboardStatsSchema = z.object({
  total_applicants: z.number(),
  avg_score: z.number(),
  in_progress: z.number(),
  completed: z.number(),
});

export const MonthlyTrendSchema = z.object({
  month: z.string(),
  applications: z.number(),
});

export const VacancySchema = z.object({
  id: z.string(),
  title: z.string(),
  faculty: z.string(),
  department: z.string(),
  is_active: z.boolean(),
});

export const EvaluationResponseSchema = z.object({
  id: z.string(),
  application_id: z.string(),
  reviewer_role: z.string(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  observations: z.string(),
  created_at: z.string(),
});

export const PresignedUrlSchema = z.object({
  url: z.string(),
});
