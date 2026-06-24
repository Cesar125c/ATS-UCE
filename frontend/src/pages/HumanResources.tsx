import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, TrendingUp } from "lucide-react";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 520 },
  { name: "Mar", value: 480 },
  { name: "Apr", value: 620 },
  { name: "May", value: 750 },
  { name: "Jun", value: 820 },
];

const candidates = [
  {
    id: 1,
    name: "Mariana Díaz Molina",
    subtitle: "Software Engineer Trainee",
    faculty: "Computer Science",
    date: "2024-06-18",
    status: "Completed",
    score: "+80",
    statusColor: "bg-green-100 text-green-800",
  },
  {
    id: 2,
    name: "María Fernández García",
    subtitle: "Junior Developer",
    faculty: "Engineering",
    date: "2024-06-10",
    status: "In Review",
    score: "+84",
    statusColor: "bg-blue-100 text-blue-800",
  },
  {
    id: 3,
    name: "Carlos Rodríguez Paz",
    subtitle: "UX/UI Designer",
    faculty: "Medicine",
    date: "2024-06-12",
    status: "Pending",
    score: "+89",
    statusColor: "bg-yellow-100 text-yellow-800",
  },
  {
    id: 4,
    name: "Sofía Cebrá Blanco",
    subtitle: "Data Analyst",
    faculty: "Architecture",
    date: "2024-06-16",
    status: "In Progress",
    score: "+82",
    statusColor: "bg-purple-100 text-purple-800",
  },
  {
    id: 5,
    name: "Andrés Villanueva",
    subtitle: "Project Manager",
    faculty: "Business Economics",
    date: "2024-06-15",
    status: "Pending",
    score: "+81",
    statusColor: "bg-orange-100 text-orange-800",
  },
];

const alerts = [
  {
    id: 1,
    title: "Selection in progress at CECl",
    time: "now (0h)",
    type: "info",
  },
  {
    id: 2,
    title: "Hiring requests have arrived for Q3",
    time: "1h ago",
    type: "info",
  },
  {
    id: 3,
    title: "New interview scheduled in Documentation",
    time: "5h ago",
    type: "warning",
  },
];

export default function HumanResources() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">HR Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Ranking of candidates, filters and selection flow tracking.
            </p>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
            New Selection
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Applicants
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">1,248</p>
              </div>
              <span className="text-blue-600 bg-blue-100 rounded-full p-2 text-sm">
                JU
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">79%</p>
              </div>
              <span className="text-blue-600 text-sm font-medium">JU</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">In Process</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">842</p>
              </div>
              <span className="text-slate-400 text-lg">⏱</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">406</p>
              </div>
              <span className="text-slate-400 text-lg">☑</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Candidates Table */}
          <div className="col-span-2 bg-white rounded-lg shadow border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 bg-gray-100 rounded-lg px-3 py-2">
                  <span className="text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by name, faculty or score..."
                    className="bg-transparent outline-none text-sm w-full"
                  />
                </div>
                <button className="ml-4 text-slate-600 hover:text-slate-900">
                  Filter by Score
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      AI Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr
                      key={candidate.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {candidate.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {candidate.subtitle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {candidate.faculty}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {candidate.date}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${candidate.statusColor}`}
                        >
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {candidate.score}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-slate-400 hover:text-slate-600">
                          ⋮
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-slate-600">
                Showing 1 to 5 of 1,248 candidates
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded border border-slate-300 text-sm hover:bg-slate-50">
                  Previous
                </button>
                <button className="px-3 py-1 rounded bg-blue-500 text-white text-sm">
                  1
                </button>
                <button className="px-3 py-1 rounded border border-slate-300 text-sm hover:bg-slate-50">
                  2
                </button>
                <button className="px-3 py-1 rounded border border-slate-300 text-sm hover:bg-slate-50">
                  24
                </button>
                <button className="px-3 py-1 rounded border border-slate-300 text-sm hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Applications Trend */}
            <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Applications Trend
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* AI Alerts */}
            <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                AI Alerts
              </h3>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 pb-3 border-b border-slate-200 last:border-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 ${alert.type === "warning" ? "bg-red-500" : "bg-blue-500"}`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 font-medium">
                        {alert.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-blue-600 text-sm font-medium mt-4 hover:text-blue-700">
                View more AI notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
