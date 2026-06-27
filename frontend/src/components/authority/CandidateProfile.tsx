import {
  CheckCircle2,
  Download,
  Building2,
  ShieldCheck,
} from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";

export default function CandidateProfile() {
  return (
    <Card className="p-8 mb-6">

      <div className="flex flex-col xl:flex-row justify-between gap-8">

        {/* Left */}

        <div className="flex gap-6">

          <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold">

            RM

          </div>

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Dr. Roberto Mendoza
            </h1>

            <p className="text-slate-600 mt-2">
              Profesor Titular · Ingeniería de Software
            </p>

            <div className="flex flex-wrap gap-5 mt-4 text-sm text-slate-500">

              <div className="flex items-center gap-2">

                <ShieldCheck
                  size={16}
                  className="text-green-600"
                />

                Validado por RR.HH.

              </div>

              <div className="flex items-center gap-2">

                <Building2
                  size={16}
                />

                Facultad de Ingeniería

              </div>

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="text-center xl:text-right">

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Score Global IA
          </p>

          <h2 className="text-6xl font-bold text-sky-500 mt-2">
            94%
          </h2>

          <Button
            className="mt-5 bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >

            <Download size={18}/>

            Descargar CV (PDF)

          </Button>

        </div>

      </div>

    </Card>
  );
}