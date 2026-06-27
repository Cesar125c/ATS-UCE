import {
  CheckCircle2,
  XCircle,
} from "lucide-react";

import Button from "../ui/Button";

export default function DecisionActions() {
  return (
    <div className="space-y-4">

      <Button
        className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
      >

        <CheckCircle2 size={18} />

        Aprobar Selección

      </Button>

      <Button
        className="w-full bg-white border border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
      >

        <XCircle size={18} />

        Rechazar Candidato

      </Button>

    </div>
  );
}