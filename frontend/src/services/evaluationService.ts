import { apiFetch } from "./api";

export interface EvaluationRequest {
  decision: "APPROVED" | "REJECTED";
  observations: string;
}

export interface EvaluationResponse {
  id: string;
  application_id: string;
  reviewer_role: string;
  decision: "APPROVED" | "REJECTED";
  observations: string;
  created_at: string;
}

export async function submitEvaluation(
  applicationId: string,
  body: EvaluationRequest,
): Promise<EvaluationResponse> {
  return apiFetch<EvaluationResponse>(
    `/api/v1/applications/${applicationId}/evaluations`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export class EvaluationError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "EvaluationError";
    this.status = status;
  }
}

export function validateEvaluation(data: EvaluationRequest): string | null {
  if (data.decision === "REJECTED" && !data.observations.trim()) {
    return "Las observaciones son requeridas cuando se rechaza un candidato.";
  }
  return null;
}
