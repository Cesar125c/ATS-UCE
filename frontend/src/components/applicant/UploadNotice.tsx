import { FileText } from "lucide-react";
import Card from "../ui/Card";

export default function UploadNotice() {
  return (
    <Card className="bg-cyan-50 border-cyan-200 p-4 mb-6">

      <div className="flex gap-3 items-start">

        <div className="bg-cyan-100 rounded-full p-2">

          <FileText
            size={18}
            className="text-cyan-700"
          />

        </div>

        <div>

          <h4 className="font-semibold text-slate-800">
            Formato requerido
          </h4>

          <p className="text-sm text-slate-600 mt-1">
            PDF únicamente. Tamaño máximo de 10 MB.
            Tu CV será analizado automáticamente para agilizar el
            proceso de validación administrativa.
          </p>

        </div>

      </div>

    </Card>
  );
}