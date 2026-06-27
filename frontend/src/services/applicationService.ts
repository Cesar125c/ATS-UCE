import type { ApplicationResponse } from "@/types/application";
import { apiFetch } from "./api";

const MAX_CV_SIZE_BYTES = 10_485_760; // 10 MB

export class ApplicationError extends Error {
  status: number;
  spanishDetail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApplicationError";
    this.status = status;
    this.spanishDetail = detail;
  }
}

function buildSpanishMessage(status: number, detail: string): string {
  if (status === 422) {
    if (detail.toLowerCase().includes("pdf")) {
      return "El archivo debe ser un PDF de máximo 10 MB.";
    }
    return detail;
  }
  if (status === 401) {
    return "No autorizado. Inicia sesión nuevamente.";
  }
  return detail || "Error desconocido al enviar la postulación.";
}

export function validateCVFile(file: File): string | null {
  if (file.type !== "application/pdf") {
    return "Sólo se aceptan archivos PDF.";
  }
  if (file.size > MAX_CV_SIZE_BYTES) {
    return "El archivo PDF no debe superar los 10 MB.";
  }
  return null;
}

export async function submitApplication(
  vacancyId: string,
  file: File,
  getToken: () => Promise<string | null>,
): Promise<ApplicationResponse> {
  const validationError = validateCVFile(file);
  if (validationError) {
    throw new ApplicationError(422, validationError);
  }

  const token = await getToken();
  if (!token) {
    throw new ApplicationError(401, "No autorizado. Inicia sesión nuevamente.");
  }

  const formData = new FormData();
  formData.append("vacancy_id", vacancyId);
  formData.append("cv_file", file, file.name);

  const response = await fetch("/api/v1/applications", {
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
      throw new ApplicationError(401, "No autorizado. Redirigiendo a inicio de sesión.");
    }

    throw new ApplicationError(response.status, buildSpanishMessage(response.status, detail));
  }

  return response.json() as Promise<ApplicationResponse>;
}

export async function getMyApplicationStatus(): Promise<ApplicationResponse[]> {
  return apiFetch<ApplicationResponse[]>("/api/v1/applicants/me/status");
}
