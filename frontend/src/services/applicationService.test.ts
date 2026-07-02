import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitApplication, validateCVFile, ApplicationError } from "./applicationService";

function createTestFile(name: string, type: string, size: number): File {
  const blob = new Blob(["x".repeat(size)], { type });
  return new File([blob], name, { type });
}

describe("validateCVFile", () => {
  it("returns null for a valid PDF under 10 MB", () => {
    const file = createTestFile("cv.pdf", "application/pdf", 1024);
    expect(validateCVFile(file)).toBeNull();
  });

  it("rejects non-PDF files", () => {
    const file = createTestFile("cv.png", "image/png", 1024);
    expect(validateCVFile(file)).toBe("Sólo se aceptan archivos PDF.");
  });

  it("rejects files over 10 MB", () => {
    const overSize = 10_485_761;
    const file = createTestFile("cv.pdf", "application/pdf", overSize);
    expect(validateCVFile(file)).toBe("El archivo PDF no debe superar los 10 MB.");
  });
});

describe("submitApplication FormData structure", () => {
  const vacancyId = "550e8400-e29b-41d4-a716-446655440000";
  const getToken = vi.fn<() => Promise<string | null>>();

  beforeEach(() => {
    vi.restoreAllMocks();
    getToken.mockResolvedValue("test-jwt-token");
  });

  it("builds FormData with vacancy_id and cv_file keys", async () => {
    const file = createTestFile("cv.pdf", "application/pdf", 1024);

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440111",
          applicant_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          vacancy_id: vacancyId,
          status: "RECEIVED",
          ai_score: null,
          status_history: [],
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        }),
    } as Response);

    await submitApplication(vacancyId, file, getToken);

    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/v1/applications");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      Authorization: "Bearer test-jwt-token",
    });

    const formData = init.body as FormData;
    expect(formData.get("vacancy_id")).toBe(vacancyId);

    const cvFile = formData.get("cv_file") as File;
    expect(cvFile).toBeInstanceOf(File);
    expect(cvFile.name).toBe("cv.pdf");
    expect(cvFile.type).toBe("application/pdf");
  });

  it("throws ApplicationError with 401 when no token is available", async () => {
    const file = createTestFile("cv.pdf", "application/pdf", 1024);
    getToken.mockResolvedValue(null);

    await expect(submitApplication(vacancyId, file, getToken)).rejects.toThrow(
      ApplicationError,
    );

    await expect(submitApplication(vacancyId, file, getToken)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("throws ApplicationError with 422 on backend validation errors", async () => {
    const file = createTestFile("cv.pdf", "application/pdf", 1024);

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ detail: "File must be a PDF under 10 MB" }),
    } as Response);

    await expect(submitApplication(vacancyId, file, getToken)).rejects.toThrow(
      ApplicationError,
    );

    await expect(submitApplication(vacancyId, file, getToken)).rejects.toMatchObject({
      status: 422,
      spanishDetail: "El archivo debe ser un PDF de máximo 10 MB.",
    });
  });
});
