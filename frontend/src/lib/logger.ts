type LogLevel = "debug" | "info" | "warn" | "error";

type AllowedContextKey =
  | "component"
  | "operation"
  | "route"
  | "endpoint"
  | "status"
  | "errorType";

export type LoggerContext = Partial<Record<AllowedContextKey, unknown>> &
  Record<string, unknown>;

const ALLOWED_CONTEXT_KEYS = new Set<AllowedContextKey>([
  "component",
  "operation",
  "route",
  "endpoint",
  "status",
  "errorType",
]);

function sanitizeLocation(value: string): string {
  return value.split(/[?#]/, 1)[0];
}

function sanitizeValue(key: AllowedContextKey, value: unknown): string | number | undefined {
  if (value instanceof Error) {
    return key === "errorType" ? value.name : undefined;
  }

  if (key === "status") {
    return typeof value === "number" ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  if (key === "endpoint" || key === "route") {
    return sanitizeLocation(value);
  }

  return value;
}

export function sanitizeLoggerContext(
  context?: LoggerContext,
): Partial<Record<AllowedContextKey, string | number>> | undefined {
  if (!context) {
    return undefined;
  }

  const sanitized: Partial<Record<AllowedContextKey, string | number>> = {};

  for (const [rawKey, rawValue] of Object.entries(context)) {
    if (!ALLOWED_CONTEXT_KEYS.has(rawKey as AllowedContextKey)) {
      continue;
    }

    const key = rawKey as AllowedContextKey;
    const value = sanitizeValue(key, rawValue);
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function emit(level: LogLevel, message: string, context?: LoggerContext): void {
  if (level === "debug" && !import.meta.env.DEV) {
    return;
  }

  const prefix = `[${level.toUpperCase()}]`;
  const sanitizedContext = sanitizeLoggerContext(context);
  const output = `${prefix} ${message}`;

  if (sanitizedContext) {
    console[level](output, sanitizedContext);
    return;
  }

  console[level](output);
}

export const logger = {
  debug: (message: string, context?: LoggerContext) => emit("debug", message, context),
  info: (message: string, context?: LoggerContext) => emit("info", message, context),
  warn: (message: string, context?: LoggerContext) => emit("warn", message, context),
  error: (message: string, context?: LoggerContext) => emit("error", message, context),
};
