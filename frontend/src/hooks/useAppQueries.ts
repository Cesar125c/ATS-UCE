import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getMyApplicationStatus,
  submitApplication,
} from "@/services/applicationService";
import {
  getApplications,
  getDashboardStats,
  getApplicationTrend,
  getApplicationHistory,
} from "@/services/dashboardService";
import {
  createVacancy,
  deleteVacancy,
  getVacancies,
  type CreateVacancyRequest,
} from "@/services/vacancyService";
import {
  submitEvaluation,
  type EvaluationRequest,
} from "@/services/evaluationService";
import type { ApplicationResponse } from "@/types/application";

export const queryKeys = {
  vacancies: ["vacancies"] as const,
  myApplications: ["my-applications"] as const,
  dashboardStats: ["dashboard-stats"] as const,
  applications: (filters: {
    status?: string;
    page: number;
    pageSize: number;
    search?: string;
  }) => ["applications", filters] as const,
  applicationTrend: ["application-trend"] as const,
  applicationHistory: (id: string) => ["application-history", id] as const,
};

function hasProcessingApplication(applications?: ApplicationResponse[]) {
  return applications?.some((app) => app.status === "PROCESSING_AI") ?? false;
}

export function useVacancies() {
  return useQuery({
    queryKey: queryKeys.vacancies,
    queryFn: getVacancies,
  });
}

export function useCreateVacancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateVacancyRequest) => createVacancy(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.vacancies });
    },
  });
}

export function useDeleteVacancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vacancyId: string) => deleteVacancy(vacancyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.vacancies });
    },
  });
}

export function useMyApplications(pollWhileProcessing = false) {
  return useQuery({
    queryKey: queryKeys.myApplications,
    queryFn: getMyApplicationStatus,
    refetchInterval: (query) => {
      if (!pollWhileProcessing) return false;
      return hasProcessingApplication(query.state.data) ? 10_000 : false;
    },
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vacancyId,
      file,
      getToken,
      extractedText,
    }: {
      vacancyId: string;
      file: File;
      getToken: () => Promise<string | null>;
      extractedText?: string;
    }) => submitApplication(vacancyId, file, getToken, extractedText),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.myApplications }),
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats }),
      ]);
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: getDashboardStats,
  });
}

export function useApplications(filters: {
  status?: string;
  page: number;
  pageSize: number;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.applications(filters),
    queryFn: () => getApplications(filters),
  });
}

export function useSubmitEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      body,
    }: {
      applicationId: string;
      body: EvaluationRequest;
    }) => submitEvaluation(applicationId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats }),
        queryClient.invalidateQueries({ queryKey: queryKeys.myApplications }),
      ]);
    },
  });
}

export function useApplicationTrend(months = 6) {
  return useQuery({
    queryKey: queryKeys.applicationTrend,
    queryFn: () => getApplicationTrend(months),
  });
}

export function useApplicationHistory(applicationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.applicationHistory(applicationId ?? ""),
    queryFn: () => getApplicationHistory(applicationId!),
    enabled: !!applicationId,
  });
}
