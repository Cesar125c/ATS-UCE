import { useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { UploadCloud, FileText, CheckCircle, AlertCircle } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { submitApplication, validateCVFile, ApplicationError } from "@/services/applicationService";
import type { ApplicationResponse } from "@/types/application";

interface UploadCVProps {
  vacancyId: string;
}

export default function UploadCV({ vacancyId }: UploadCVProps) {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplicationResponse | null>(null);

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
    }
  }, []);

  const handleSubmit = async () => {
    if (!file) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const data = await submitApplication(vacancyId, file, getToken);
      setResult(data);
    } catch (e) {
      if (e instanceof ApplicationError) {
        setError(e.spanishDetail);
      } else {
        setError("Error inesperado al enviar la postulación.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <Card className="p-6 h-full">
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            ¡Postulación enviada!
          </h3>
          <p className="text-slate-500">
            Tu CV ha sido recibido y será analizado automáticamente.
          </p>
          <button
            type="button"
            className="mt-6 text-sm text-blue-600 hover:underline"
            onClick={() => {
              setResult(null);
              setFile(null);
            }}
          >
            Enviar otra postulación
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Subir Curriculum Vitae
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Sólo archivos PDF. El análisis mediante IA se ejecuta
          automáticamente después del envío.
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center text-center transition cursor-pointer ${
          file
            ? "border-green-400 bg-green-50"
            : error
              ? "border-red-400 bg-red-50"
              : "border-slate-300 hover:border-red-400 hover:bg-red-50"
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <UploadCloud size={26} className="text-sky-500" />
        </div>

        {file ? (
          <>
            <h3 className="font-medium text-slate-700">{file.name}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(1)} MB — Haz clic para cambiar
            </p>
          </>
        ) : (
          <>
            <h3 className="font-medium text-slate-700">
              Arrastra o haz clic para subir
            </h3>
            <p className="text-sm text-slate-500 mt-2">PDF — máximo 10 MB</p>
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

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
        disabled={!file || isSubmitting}
        isLoading={isSubmitting}
        onClick={handleSubmit}
      >
        <FileText size={18} />
        Enviar Nueva Postulación
      </Button>
    </Card>
  );
}
