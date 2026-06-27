import Button from "../ui/Button";
import { Download } from "lucide-react";

export default function ApplicantHeader() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Portal del Postulante
        </h1>

        <p className="text-slate-500 mt-2">
          Carga tu CV y sigue el estado de tu postulación en tiempo real mediante
          nuestro sistema de IA.
        </p>

      </div>

      <Button
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download size={18} />

        Descargar Guía

      </Button>

    </div>
  );
}