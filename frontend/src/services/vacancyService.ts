import { apiFetch } from "./api";
import type { Vacancy } from "@/types/vacancy";

export async function getVacancies(): Promise<Vacancy[]> {
  return apiFetch<Vacancy[]>("/api/v1/vacancies");
}
