import Card from "../ui/Card";
import CandidateRow from "./CandidateRow";

const candidates = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Frontend Developer",
    score: 94,
    status: "Interview",
    experience: "5 years",
  },
  {
    id: 2,
    name: "Michael Chen",
    position: "Backend Developer",
    score: 91,
    status: "Review",
    experience: "6 years",
  },
  {
    id: 3,
    name: "Emily Davis",
    position: "UX/UI Designer",
    score: 88,
    status: "Hired",
    experience: "4 years",
  },
  {
    id: 4,
    name: "David Wilson",
    position: "Data Analyst",
    score: 84,
    status: "Pending",
    experience: "3 years",
  },
];

export default function CandidateTable() {
  return (
    <Card className="p-0 overflow-hidden">

      <div className="px-6 py-5 border-b">

        <h2 className="text-xl font-semibold">
          Candidate Ranking
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          AI evaluated applicants ordered by score.
        </p>

      </div>

      <table className="w-full">

        <thead className="bg-slate-50">

          <tr className="text-left text-sm text-slate-600">

            <th className="px-6 py-3">Candidate</th>

            <th className="px-6 py-3">Position</th>

            <th className="px-6 py-3">Experience</th>

            <th className="px-6 py-3">Score</th>

            <th className="px-6 py-3">Status</th>

          </tr>

        </thead>

        <tbody>

          {candidates.map(candidate => (

            <CandidateRow
              key={candidate.id}
              candidate={candidate}
            />

          ))}

        </tbody>

      </table>

    </Card>
  );
}