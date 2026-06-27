import Badge from "../ui/Badge";

interface Candidate {
  id: number;
  name: string;
  position: string;
  experience: string;
  score: number;
  status: string;
}

interface CandidateRowProps {
  candidate: Candidate;
}

export default function CandidateRow({
  candidate,
}: CandidateRowProps) {
  const badgeVariant = () => {
    switch (candidate.status) {
      case "Hired":
        return "success";

      case "Interview":
        return "primary";

      case "Review":
        return "warning";

      default:
        return "secondary";
    }
  };

  return (
    <tr className="border-b hover:bg-slate-50 transition-colors">

      {/* Candidate */}

      <td className="px-6 py-4">

        <div className="flex items-center gap-4">

          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center font-semibold text-red-600">

            {candidate.name
              .split(" ")
              .map((word) => word[0])
              .join("")}

          </div>

          <div>

            <p className="font-medium text-slate-800">
              {candidate.name}
            </p>

            <p className="text-sm text-slate-500">
              Candidate #{candidate.id}
            </p>

          </div>

        </div>

      </td>

      {/* Position */}

      <td className="px-6 py-4 text-slate-700">
        {candidate.position}
      </td>

      {/* Experience */}

      <td className="px-6 py-4 text-slate-700">
        {candidate.experience}
      </td>

      {/* Score */}

      <td className="px-6 py-4">

        <div className="flex items-center gap-3">

          <div className="w-28 h-2 rounded-full bg-slate-200 overflow-hidden">

            <div
              className="bg-red-600 h-full rounded-full"
              style={{
                width: `${candidate.score}%`,
              }}
            />

          </div>

          <span className="font-semibold text-sm">
            {candidate.score}%
          </span>

        </div>

      </td>

      {/* Status */}

      <td className="px-6 py-4">

        <Badge variant={badgeVariant()}>
          {candidate.status}
        </Badge>

      </td>

    </tr>
  );
}