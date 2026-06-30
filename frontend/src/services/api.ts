let _getToken: (() => Promise<string | null>) | null = null;

export function initApi(getTokenFn: () => Promise<string | null>) {
  _getToken = getTokenFn;
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

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    window.location.assign("/login");
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.detail || body.message || "";
    } catch {
      // body may not be JSON
    }
    throw new ApiError(res.status, detail || res.statusText);
  }

  return res.json() as Promise<T>;
}
