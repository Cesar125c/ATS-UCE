import { z } from "zod";
import type { ApplicationResponse } from "@/types/application";
import { ApplicationResponseSchema } from "@/schemas/api";
import { apiFetch } from "./api";

const MAX_CV_SIZE_BYTES = 10_485_760; // 10 MB

export class ApplicationError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApplicationError";
    this.status = status;
    this.detail = detail;
  }
}

function buildErrorMessage(status: number, detail: string): string {
  if (status === 422) {
    if (detail.toLowerCase().includes("pdf")) {
      return "The file must be a PDF of up to 10 MB.";
    }
    return detail;
  }
  if (status === 401) {
    return "Not authorized. Please sign in again.";
  }
  return detail || "Unknown error while submitting the application.";
}

export function validateCVFile(file: File): string | null {
  if (file.type !== "application/pdf") {
    return "Only PDF files are accepted.";
  }
  if (file.size > MAX_CV_SIZE_BYTES) {
    return "The PDF file must not exceed 10 MB.";
  }
  return null;
}

export async function submitApplication(
  vacancyId: string,
  file: File,
  getToken: () => Promise<string | null>,
  extractedText?: string,
): Promise<ApplicationResponse> {
  const validationError = validateCVFile(file);
  if (validationError) {
    throw new ApplicationError(422, validationError);
  }

  const token = await getToken();
  if (!token) {
    throw new ApplicationError(401, "Not authorized. Please sign in again.");
  }

  const formData = new FormData();
  formData.append("vacancy_id", vacancyId);
  formData.append("cv_file", file, file.name);
  if (extractedText) {
    formData.append("extracted_text", extractedText);
  }

  // Keep browser requests relative so Vite/Nginx proxies them to the API.
  // Never expose Docker's internal `api` hostname to the browser.
  const response = await fetch("/api/v1/applications/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let detail = "";
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || "";
    } catch {
      // body may not be JSON
    }

    if (response.status === 401) {
      window.location.assign("/login");
      throw new ApplicationError(401, "Not authorized. Redirecting to sign in.");
    }

    throw new ApplicationError(response.status, buildErrorMessage(response.status, detail));
  }

  const data = await response.json();
  return ApplicationResponseSchema.parse(data);
}

export async function getMyApplicationStatus(): Promise<ApplicationResponse[]> {
  const data = await apiFetch<{ applications: ApplicationResponse[] }>(
    "/api/v1/applicants/me/status",
    undefined,
    z.object({ applications: z.array(ApplicationResponseSchema) }),
  );
  return data.applications ?? [];
}
