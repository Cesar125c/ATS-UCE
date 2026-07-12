import { useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { UploadCloud, FileText, CheckCircle, AlertCircle } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { validateCVFile, ApplicationError } from "@/services/applicationService";
import { useSubmitApplication, useVacancies } from "@/hooks/useAppQueries";
import { extractTextFromPdf } from "@/utils/pdfExtractor";
import type { ApplicationResponse } from "@/types/application";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadCV() {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedVacancyId, setSelectedVacancyId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplicationResponse | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const {
    data: vacancies = [],
    isLoading: vacanciesLoading,
    isError: vacanciesError,
  } = useVacancies();
  const submitApplicationMutation = useSubmitApplication();

  const canSubmit = Boolean(selectedVacancyId && file && !isExtracting);

  const startExtraction = async (pdfFile: File) => {
    setIsExtracting(true);
    setExtractedText(null);
    try {
      const text = await extractTextFromPdf(pdfFile);
      setExtractedText(text);
    } catch (e) {
      console.warn("Wasm extraction failed, will fall back to server-side", e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validationError = validateCVFile(droppedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
        return;
      }
      setError(null);
      setFile(droppedFile);
      startExtraction(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validationError = validateCVFile(selectedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
      startExtraction(selectedFile);
    }
  }, []);

  const handleSubmit = async () => {
    if (!file || !selectedVacancyId) return;

    setError(null);
    try {
      const data = await submitApplicationMutation.mutateAsync({
        vacancyId: selectedVacancyId,
        file,
        getToken,
        extractedText: extractedText ?? undefined,
      });
      setResult(data);
    } catch (e) {
      if (e instanceof ApplicationError) {
        setError(e.detail);
      } else {
        setError("Unexpected error while submitting the application.");
      }
    }
  };

  if (result) {
    return (
      <Card className="p-6 h-full border border-slate-200 shadow-none">
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Application submitted!
          </h3>
          <p className="text-slate-500">
            Your CV has been received and will be analyzed automatically.
          </p>
          <button
            type="button"
            className="mt-6 text-sm text-blue-600 hover:underline"
            onClick={() => {
              setResult(null);
              setFile(null);
              setSelectedVacancyId("");
              setExtractedText(null);
            }}
          >
            Submit another application
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full border border-slate-200 shadow-none">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">
          Upload Curriculum Vitae
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Select a vacancy and upload your CV in PDF. The AI analysis runs
          automatically after submission.
        </p>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Vacancy
        </label>

        {vacanciesLoading ? (
          <div className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-400">
            Loading vacancies...
          </div>
        ) : vacanciesError ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{vacanciesError}</p>
          </div>
        ) : vacancies.length === 0 ? (
          <div className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-500 bg-slate-50">
            No vacancies available at this time.
          </div>
        ) : (
          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900"
            value={selectedVacancyId}
            onChange={(e) => setSelectedVacancyId(e.target.value)}
          >
            <option value="">Select a vacancy</option>
            {vacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} — {v.faculty}
              </option>
            ))}
          </select>
        )}
      </div>

      <div
        className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center text-center transition cursor-pointer ${
          file
            ? "border-green-400 bg-green-50"
            : error
              ? "border-red-400 bg-red-50"
              : "border-slate-300 hover:border-[#2369ad] hover:bg-blue-50/40"
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <UploadCloud size={26} className="text-[#174f8d]" />
        </div>

        {file ? (
          <>
            <h3 className="font-medium text-slate-700">{file.name}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {formatFileSize(file.size)} — Click to change
            </p>
          </>
        ) : (
          <>
            <h3 className="font-medium text-slate-700">
              Drag or click to upload
            </h3>
            <p className="text-sm text-slate-500 mt-2">PDF — maximum 10 MB</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      {isExtracting && (
        <p className="text-sm text-blue-600 mt-2 text-center flex items-center justify-center gap-1">
          <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Extracting text with WebAssembly...
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        variant="primary"
        fullWidth
        className="mt-6 rounded-lg bg-[#174f8d] hover:bg-[#103e71] disabled:opacity-50"
        disabled={!canSubmit || submitApplicationMutation.isPending}
        isLoading={submitApplicationMutation.isPending}
        onClick={handleSubmit}
      >
        <FileText size={18} />
        Submit New Application
      </Button>
    </Card>
  );
}
