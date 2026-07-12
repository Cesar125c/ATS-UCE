import { z } from "zod";

let _getToken: (() => Promise<string | null>) | null = null;

function resolveApiBaseUrl(): string {
  const configuredUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
  if (!configuredUrl) return "";

  try {
    const url = new URL(configuredUrl);
    // Docker service names are only resolvable inside the Docker network. In
    // the browser, use the current origin so Vite/Nginx can proxy /api.
    if (url.hostname === "api") return "";
  } catch {
    // Relative base URLs are valid and should be preserved.
  }

  return configuredUrl;
}

const apiBaseUrl = resolveApiBaseUrl();

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

  const res = await fetch(buildApiUrl(input), { ...init, headers });

  if (res.status === 401) {
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
    throw new ApiError(res.status, detail || res.statusText);
  }

  const data = await res.json();

  if (schema) {
    return schema.parse(data);
  }

  return data as T;
}
