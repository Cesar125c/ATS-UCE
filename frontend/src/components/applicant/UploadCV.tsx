import { UploadCloud, FileText } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function UploadCV() {
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

      <div className="border-2 border-dashed border-slate-300 rounded-xl h-64 flex flex-col items-center justify-center text-center transition hover:border-red-400 hover:bg-red-50 cursor-pointer">

        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">

          <UploadCloud
            size={26}
            className="text-sky-500"
          />

        </div>

        <h3 className="font-medium text-slate-700">
          Arrastra o haz clic para subir
        </h3>

        <p className="text-sm text-slate-500 mt-2">
          PDF — máximo 10 MB
        </p>

      </div>

      <Button
        className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white"
      >

        <FileText size={18} />

        Enviar Nueva Postulación

      </Button>

    </Card>
  );
}