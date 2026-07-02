import Card from "../ui/Card";
import CandidateCard from "./CandidateCard";
import { Clock3 } from "lucide-react";

const candidates = [
  {
    id: 1,
    name: "Dr. Roberto Mendoza",
    position: "Profesor Titular - Ingeniería Software",
    faculty: "Facultad de Ingeniería",
    score: 94,
  },
  {
    id: 2,
    name: "Dra. Elena Vizcaíno",
    position: "Investigador Senior - Biotecnología",
    faculty: "Facultad Ciencias de la Vida",
    score: 89,
  },
  {
    id: 3,
    name: "Mgs. Carlos Jaramillo",
    position: "Docente Auxiliar - Macroeconomía",
    faculty: "Facultad Economía",
    score: 76,
  },
  {
    id: 4,
    name: "Dra. María Torres",
    position: "Profesor Principal - Derecho",
    faculty: "Facultad Jurisprudencia",
    score: 91,
  },
];

export default function PendingCandidates() {
  return (
    <Card className="p-0 overflow-hidden h-full">

      <div className="p-5 border-b flex items-center justify-between">

        <div className="flex items-center gap-2">

          <Clock3
            size={18}
            className="text-sky-600"
          />

          <h2 className="font-semibold">
            Pendientes de Aprobación
          </h2>

        </div>

        <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-semibold">
          {candidates.length}
        </span>

      </div>

      {candidates.map((candidate, index) => (

        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          selected={index === 0}
        />

      ))}

    </Card>
  );
}