import { z } from "zod";
import { apiFetch } from "./api";
import type { Vacancy } from "@/types/vacancy";
import { VacancySchema } from "@/schemas/api";

export interface CreateVacancyRequest {
  title: string;
  faculty: string;
  department: string;
  description: string;
  requirements: string;
}

export async function getVacancies(): Promise<Vacancy[]> {
  return apiFetch<Vacancy[]>("/api/v1/vacancies/", undefined, z.array(VacancySchema));
}

export async function createVacancy(body: CreateVacancyRequest): Promise<Vacancy> {
  return apiFetch<Vacancy>("/api/v1/vacancies/", {
    method: "POST",
    body: JSON.stringify(body),
  }, VacancySchema);
}

export async function deleteVacancy(vacancyId: string): Promise<void> {
  await apiFetch(`/api/v1/vacancies/${vacancyId}`, {
    method: "DELETE",
  });
}
