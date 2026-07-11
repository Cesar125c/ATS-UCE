import { z } from "zod";
import { ApplicationResponseSchema, AIScoreSchema, StatusHistorySchema, FlowStatusSchema } from "@/schemas/api";

export type FlowStatus = z.infer<typeof FlowStatusSchema>;
export type AIScoreDTO = z.infer<typeof AIScoreSchema>;
export type StatusHistoryDTO = z.infer<typeof StatusHistorySchema>;
export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;
