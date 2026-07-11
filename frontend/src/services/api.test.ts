import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch, initApi } from "./api";

function mockResponse(response: Partial<Response>): Response {
  return response as Response;
}

describe("apiFetch logging", () => {
  beforeEach(() => {
    initApi(async () => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("logs network failures with logger.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const networkError = new TypeError("Network failed");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(networkError);

    await expect(apiFetch("/api/v1/users?token=secret")).rejects.toBe(networkError);

    expect(errorSpy).toHaveBeenCalledWith("[ERROR] API request failed", {
      operation: "api_fetch",
      endpoint: "/api/v1/users",
      errorType: "TypeError",
    });
  });

  it("logs 400 responses with logger.warn and preserves ApiError", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: () => Promise.resolve({ detail: "Invalid request" }),
      }),
    );

    await expect(apiFetch("/api/v1/users?token=secret")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Invalid request",
    });

    expect(warnSpy).toHaveBeenCalledWith("[WARN] API request failed", {
      operation: "api_fetch",
      endpoint: "/api/v1/users",
      status: 400,
      errorType: "ApiError",
    });
  });

  it("logs 500 responses with logger.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.resolve({ detail: "Server error" }),
      }),
    );

    await expect(apiFetch("/api/v1/users")).rejects.toBeInstanceOf(ApiError);

    expect(errorSpy).toHaveBeenCalledWith("[ERROR] API request failed", {
      operation: "api_fetch",
      endpoint: "/api/v1/users",
      status: 500,
      errorType: "ApiError",
    });
  });

  it("does not log token, headers, body, response, or query string", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    initApi(async () => "secret-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: () => Promise.resolve({ detail: "Invalid request" }),
      }),
    );

    await expect(
      apiFetch("/api/v1/users?token=secret", {
        method: "POST",
        body: JSON.stringify({ token: "body-secret" }),
      }),
    ).rejects.toBeInstanceOf(ApiError);

    const loggedValue = JSON.stringify(warnSpy.mock.calls);
    expect(loggedValue).not.toContain("secret-token");
    expect(loggedValue).not.toContain("Authorization");
    expect(loggedValue).not.toContain("headers");
    expect(loggedValue).not.toContain("body");
    expect(loggedValue).not.toContain("response");
    expect(loggedValue).not.toContain("token=secret");
  });

  it("keeps 401 redirect behavior and ApiError message", async () => {
    const assign = vi.fn();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("window", { location: { assign } });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: () => Promise.resolve({ detail: "Ignored" }),
      }),
    );

    await expect(apiFetch("/api/v1/private?token=secret")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Unauthorized",
    });

    expect(assign).toHaveBeenCalledWith("/login");
    expect(warnSpy).toHaveBeenCalledWith("[WARN] API request failed", {
      operation: "api_fetch",
      endpoint: "/api/v1/private",
      status: 401,
      errorType: "ApiError",
    });
  });
});
