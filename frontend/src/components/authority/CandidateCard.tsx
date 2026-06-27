import Badge from "../ui/Badge";

export interface Candidate {
  id: number;
  name: string;
  position: string;
  faculty: string;
  score: number;
}

interface CandidateCardProps {
  candidate: Candidate;
  selected?: boolean;
}

export default function CandidateCard({
  candidate,
  selected = false,
}: CandidateCardProps) {
  return (
    <div
      className={`cursor-pointer border-b transition-all p-5 ${
        selected
          ? "border-l-4 border-l-sky-500 bg-sky-50"
          : "hover:bg-slate-50"
      }`}
    >
      <div className="flex justify-between">

        <div>

          <h3 className="font-semibold text-slate-800">
            {candidate.name}
          </h3>

          <p className="text-sm text-slate-600 mt-1">
            {candidate.position}
          </p>

          <p className="text-xs uppercase text-slate-400 mt-1">
            {candidate.faculty}
          </p>

        </div>

        <Badge variant="primary">
          IA {candidate.score}
        </Badge>

      </div>
    </div>
  );
}