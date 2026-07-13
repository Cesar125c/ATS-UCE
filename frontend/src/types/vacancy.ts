import { z } from "zod";
import { VacancySchema } from "@/schemas/api";

export type Vacancy = z.infer<typeof VacancySchema>;
