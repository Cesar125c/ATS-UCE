import { z } from "zod";

import { logger } from "@/lib/logger";

let _getToken: (() => Promise<string | null>) | null = null;

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function initApi(getTokenFn: () => Promise<string | null>) {
  _getToken = getTokenFn;
}

export function buildApiUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!apiBaseUrl || typeof input !== "string" || !input.startsWith("/")) {
    return input;
  }

  return `${apiBaseUrl}${input}`;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function normalizeLogEndpoint(value: string): string {
  if (value.startsWith("/")) {
    return value;
  }

  try {
    const url = new URL(value);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}

function getLogEndpoint(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return normalizeLogEndpoint(input);
  }

  if (input instanceof URL) {
    return `${input.pathname}${input.search}${input.hash}`;
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    return normalizeLogEndpoint(input.url);
  }

  return String(input);
}

function getErrorType(error: unknown): string {
  return error instanceof Error ? error.name : typeof error;
}

function logApiError(input: RequestInfo | URL, status: number): void {
  const context = {
    operation: "api_fetch",
    endpoint: getLogEndpoint(input),
    status,
    errorType: "ApiError",
  };

  if (status >= 500) {
    logger.error("API request failed", context);
    return;
  }

  logger.warn("API request failed", context);
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  schema?: z.ZodType<T>,
): Promise<T> {
  const token = _getToken ? await _getToken() : null;

  const headers: Record<string, string> = {};

  if (init?.headers) {
    const src = init.headers;
    if (src instanceof Headers) {
      src.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(src)) {
      for (const [key, value] of src) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, src);
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const isFormData = init?.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(buildApiUrl(input), { ...init, headers });
  } catch (error) {
    logger.error("API request failed", {
      operation: "api_fetch",
      endpoint: getLogEndpoint(input),
      errorType: getErrorType(error),
    });
    throw error;
  }

  if (res.status === 401) {
    logApiError(input, res.status);
    window.location.assign("/login");
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      const raw = body.detail || body.message || "";
      if (Array.isArray(raw)) {
        detail = raw.map((e: { msg: string }) => e.msg).join("; ");
      } else if (typeof raw === "string") {
        detail = raw;
      } else {
        detail = String(raw);
      }
    } catch {
      // body may not be JSON
    }
    logApiError(input, res.status);
    throw new ApiError(res.status, detail || res.statusText);
  }

  const data = await res.json();

  if (schema) {
    return schema.parse(data);
  }

  return data as T;
}
