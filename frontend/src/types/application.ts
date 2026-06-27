export type FlowStatus =
  | "RECEIVED"
  | "PROCESSING_AI"
  | "HR_STAGE"
  | "DEAN_STAGE"
  | "RECTOR_STAGE"
  | "FINANCE_STAGE"
  | "HIRED"
  | "REJECTED";

export interface AIScoreDTO {
  total: number;
  academic_training: number;
  experience: number;
  publications: number;
  profile_match: number;
  languages_competencies: number;
  evaluation_summary: string;
  grade: string;
}

export interface StatusHistoryDTO {
  status: FlowStatus;
  transitioned_at: string;
}

export interface ApplicationResponse {
  id: string;
  applicant_id: string;
  vacancy_id: string;
  status: FlowStatus;
  ai_score: AIScoreDTO | null;
  status_history: StatusHistoryDTO[];
  created_at: string;
  updated_at: string;
}
