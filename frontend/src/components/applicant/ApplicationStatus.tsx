import {
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
} from "lucide-react";
import Card from "../ui/Card";

const steps = [
  {
    title: "Recibido",
    date: "14 Abr",
    status: "completed",
  },
  {
    title: "Validación IA",
    date: "15 Abr",
    status: "completed",
  },
  {
    title: "Revisión RRHH",
    date: "En curso",
    status: "current",
  },
  {
    title: "Decano",
    date: "--",
    status: "pending",
  },
  {
    title: "Rector",
    date: "--",
    status: "pending",
  },
  {
    title: "Financiero",
    date: "--",
    status: "pending",
  },
];

export default function ApplicationStatus() {
  return (
    <Card className="p-6 mt-6">

      <div className="flex items-start justify-between mb-8">

        <div>

          <h2 className="text-xl font-semibold">
            Estado de Tu Postulación
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Seguimiento en tiempo real del proceso de selección.
          </p>

        </div>

        <span className="text-xs bg-slate-100 rounded-full px-3 py-1">
          ID: 8541-A
        </span>

      </div>

      <div className="flex justify-between items-center mb-10">

        {steps.map((step, index) => (

          <div
            key={step.title}
            className="flex-1 flex flex-col items-center relative"
          >

            {index !== steps.length - 1 && (
              <div className="absolute top-5 left-1/2 w-full h-[2px] bg-slate-200" />
            )}

            <div className="relative z-10">

              {step.status === "completed" && (
                <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                  <CheckCircle2 size={18}/>
                </div>
              )}

              {step.status === "current" && (
                <div className="w-10 h-10 rounded-full border-4 border-sky-500 bg-white flex items-center justify-center">
                  <Clock3
                    size={18}
                    className="text-sky-500"
                  />
                </div>
              )}

              {step.status === "pending" && (
                <div className="w-10 h-10 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center">
                  <Circle
                    size={14}
                    className="text-slate-300"
                  />
                </div>
              )}

            </div>

            <p className="font-medium text-sm mt-3">
              {step.title}
            </p>

            <p className="text-xs text-slate-500">
              {step.date}
            </p>

          </div>

        ))}

      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex justify-between items-center">

        <div className="flex gap-3">

          <Eye
            className="text-sky-500 mt-1"
            size={18}
          />

          <div>

            <h4 className="font-semibold">
              Tu postulación se encuentra en Validación RRHH.
            </h4>

            <p className="text-sm text-slate-600 mt-1">
              Estamos verificando la validez de tus certificados.
              Recibirás un correo con novedades en las próximas 48 horas.
            </p>

          </div>

        </div>

      </div>

    </Card>
  );
}