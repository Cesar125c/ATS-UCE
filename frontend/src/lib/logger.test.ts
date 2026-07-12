import { afterEach, describe, expect, it, vi } from "vitest";

import { logger, sanitizeLoggerContext, type LoggerContext } from "./logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls console.debug in development", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    logger.debug("debug message", { component: "TestComponent" });

    expect(debugSpy).toHaveBeenCalledWith("[DEBUG] debug message", {
      component: "TestComponent",
    });
  });

  it("calls console.info", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    logger.info("info message", { operation: "load_data" });

    expect(infoSpy).toHaveBeenCalledWith("[INFO] info message", {
      operation: "load_data",
    });
  });

  it("calls console.warn", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    logger.warn("warn message", { status: 404 });

    expect(warnSpy).toHaveBeenCalledWith("[WARN] warn message", {
      status: 404,
    });
  });

  it("calls console.error", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.error("error message", { errorType: "ApiError" });

    expect(errorSpy).toHaveBeenCalledWith("[ERROR] error message", {
      errorType: "ApiError",
    });
  });

  it("sanitizes endpoint query string", () => {
    const context = sanitizeLoggerContext({
      endpoint: "/api/v1/users?token=secret#profile",
    });

    expect(context).toEqual({ endpoint: "/api/v1/users" });
  });

  it("sanitizes route fragment", () => {
    const context = sanitizeLoggerContext({
      route: "/applicant#section",
    });

    expect(context).toEqual({ route: "/applicant" });
  });

  it("drops sensitive and unknown keys", () => {
    const context = sanitizeLoggerContext({
      component: "UploadCV",
      token: "secret",
      authorization: "Bearer secret",
      cookie: "session=secret",
      headers: { Authorization: "Bearer secret" },
      body: { value: "secret" },
      response: { detail: "secret" },
      formData: new FormData(),
      email: "user@example.com",
      clerkUserId: "user_123",
      cv: "cv text",
      file: new File(["x"], "cv.pdf"),
      filename: "cv.pdf",
      unknown: "value",
    });

    expect(context).toEqual({ component: "UploadCV" });
  });

  it("does not propagate full Error objects", () => {
    const context = sanitizeLoggerContext({
      component: new Error("component failed"),
      errorType: new TypeError("bad type"),
    });

    expect(context).toEqual({ errorType: "TypeError" });
  });

  it("does not mutate the original context", () => {
    const original: LoggerContext = {
      endpoint: "/api/v1/health?token=secret",
      token: "secret",
    };

    sanitizeLoggerContext(original);

    expect(original).toEqual({
      endpoint: "/api/v1/health?token=secret",
      token: "secret",
    });
  });
});
