import { useState } from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

const candidates = [
  {
    id: 1,
    name: "Dr. Roberto Mendoza",
    title: "Associate Professor - Software Engineering",
    faculty: "FACULTY OF ENGINEERING",
    score: "IA 94",
    status: "pending",
    avatar: "🧑‍💼",
  },
  {
    id: 2,
    name: "Dra. Elena Vizcaíno",
    title: "Senior Researcher - Biotechnology",
    faculty: "FACULTY OF LIFE SCIENCES",
    score: "IA 89",
    status: "pending",
    avatar: "👩‍🔬",
  },
  {
    id: 3,
    name: "Mgs. Carlos Jaramillo",
    title: "Associate Professor - Macroeconomics",
    faculty: "FACULTY OF ECONOMICS",
    score: "IA 76",
    status: "pending",
    avatar: "👨‍🏫",
  },
  {
    id: 4,
    name: "Dra. María Lucia Torres",
    title: "Main Professor - Civil Law",
    faculty: "FACULTY OF JURISPRUDENCE",
    score: "IA 91",
    status: "pending",
    avatar: "👩‍⚖️",
  },
];

const processHistory = [
  {
    title: "HR HR Validation",
    date: "Completed - 12 Oct 2024",
    status: "completed",
  },
  {
    title: "Technical Interview",
    date: "Pending - 31 Oct 2024",
    status: "pending",
  },
  {
    title: "Authority Decision",
    date: "Pending - TBD",
    status: "pending",
  },
];

export default function Authorities() {
  const [selectedCandidate, setSelectedCandidate] = useState(candidates[0]);

  return (
    <div className="min-h-screen bg-blue-900">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-blue-900 font-bold">
              A
            </div>
            <span className="font-bold text-lg">ATS-UCE</span>
            <span className="bg-blue-300 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">
              AUTHORITY PORTAL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search candidates..."
              className="px-4 py-2 rounded-lg bg-blue-800 text-white placeholder-blue-300 text-sm"
            />
            <button className="text-blue-300 hover:text-white">🔔</button>
            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
              👤
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-4 gap-6">
        {/* Sidebar - Candidates List */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-lg border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Pending Approval
                <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {candidates.length}
                </span>
              </h2>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                    selectedCandidate.id === candidate.id
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-900 text-sm">
                    {candidate.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {candidate.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 uppercase">
                    {candidate.faculty}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      {candidate.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-3 space-y-6">
          {/* Candidate Profile Card */}
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-4xl">
                  {selectedCandidate.avatar}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {selectedCandidate.name}
                  </h1>
                  <p className="text-slate-600">{selectedCandidate.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-600">
                      Validated for HR
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      {selectedCandidate.faculty}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-blue-600">
                  {selectedCandidate.score.split(" ")[1]}
                </p>
                <p className="text-sm text-slate-600">GLOBAL AI SCORE</p>
                <button className="mt-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                  View Full Profile
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* AI Analysis Summary */}
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                AI Analysis Summary
              </h2>
              <p className="text-slate-700 text-sm mb-4 italic">
                "Candidate with exceptional trajectory in research. Excellent
                institutional references in scientific production and years of
                academic teaching experience."
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">
                      Academic Training
                    </span>
                    <span className="text-sm font-bold text-blue-600">98%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "98%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">
                      Teaching Experience
                    </span>
                    <span className="text-sm font-bold text-blue-600">92%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "92%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">
                      Scientific Production
                    </span>
                    <span className="text-sm font-bold text-blue-600">93%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "93%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">
                      Languages
                    </span>
                    <span className="text-sm font-bold text-blue-600">85%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process History */}
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Process History
              </h2>

              <div className="space-y-4">
                {processHistory.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {item.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-500 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decision Form */}
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Authority Decision Form
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observations and Justification
                </label>
                <textarea
                  placeholder="Enter final observations for the hiring decision resolution..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  rows={4}
                ></textarea>
                <p className="text-xs text-slate-500 mt-2">
                  These observations will be recorded in the official history of
                  the system and sent to the human resources department.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Approve Selection
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Reject Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
