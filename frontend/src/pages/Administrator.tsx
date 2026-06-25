import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  AlertCircle,
  BarChart3,
  HelpCircle,
} from "lucide-react";

const vacancies = [
  {
    id: "VAC-001",
    title: "Artificial Intelligence Professor",
    faculty: "Engineering",
    type: "Full Time",
    status: "Active",
    applicants: 45,
    color: "bg-green-100 text-green-800",
  },
  {
    id: "VAC-002",
    title: "Biotechnology Researcher",
    faculty: "Life Sciences",
    type: "Part Time",
    status: "Paused",
    applicants: 12,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "VAC-003",
    title: "Integral Calculus Professor",
    faculty: "Mathematics",
    type: "Full Time",
    status: "Active",
    applicants: 38,
    color: "bg-green-100 text-green-800",
  },
  {
    id: "VAC-004",
    title: "Criminal Law Professor",
    faculty: "Jurisprudence",
    type: "Full Time",
    status: "Closed",
    applicants: 89,
    color: "bg-red-100 text-red-800",
  },
  {
    id: "VAC-005",
    title: "Graphic Design Professor",
    faculty: "Arts",
    type: "By Hours",
    status: "Active",
    applicants: 24,
    color: "bg-green-100 text-green-800",
  },
];

const tabsData = [
  { id: "vacancies", label: "Vacancies", icon: LayoutDashboard },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "configuration", label: "Configuration", icon: Settings },
  { id: "help", label: "Help Center", icon: HelpCircle },
];

export default function Administrator() {
  const [activeTab, setActiveTab] = useState("vacancies");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-blue-900 font-bold">
              A
            </div>
            <span className="font-bold text-lg">ATS-UCE</span>
            <span className="bg-blue-300 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">
              HR PORTAL
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

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-5 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden sticky top-6">
            <nav className="p-0">
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Menu
                </p>
              </div>

              <button className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-l-4 border-transparent hover:border-blue-600 transition-colors">
                <LayoutDashboard className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700 font-medium">Dashboard</span>
              </button>

              <button className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-l-4 border-transparent hover:border-blue-600 transition-colors">
                <Users className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700 font-medium">Candidates</span>
              </button>

              <button className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-l-4 border-transparent hover:border-blue-600 transition-colors">
                <Shield className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700 font-medium">Authorities</span>
              </button>

              <button className="w-full px-4 py-3 text-left bg-blue-50 flex items-center gap-3 border-l-4 border-blue-600">
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600 font-semibold">
                  Administration
                </span>
              </button>

              <div className="mt-6 pt-6 border-t border-slate-200 px-4 py-3 space-y-2">
                <button className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 rounded transition-colors">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Configuration</span>
                </button>
                <button className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 rounded transition-colors text-red-600 font-medium">
                  <span>→</span>
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-4 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Administrative Management
            </h1>
            <p className="text-slate-600">
              Central panel for system configuration, data analysis and
              institutional support.
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-0">
            <div className="flex items-center gap-0 border-b border-slate-200">
              {tabsData.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-blue-600"
                        : "text-slate-600 border-b-transparent hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content - Vacancies */}
            {activeTab === "vacancies" && (
              <div className="p-6">
                {/* Search and Filters */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 flex-1 bg-gray-100 rounded-lg px-4 py-2 max-w-md">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search vacancy by title or faculty..."
                      className="bg-transparent outline-none text-sm w-full"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-gray-100 rounded-lg border border-slate-300">
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">
                    <Plus className="w-4 h-4" />
                    New Vacancy
                  </button>
                </div>

                {/* Vacancies Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Position Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Faculty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Applicants
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vacancies.map((vacancy) => (
                        <tr
                          key={vacancy.id}
                          className="border-b border-slate-200 hover:bg-slate-50"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {vacancy.id}
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {vacancy.title}
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {vacancy.faculty}
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {vacancy.type}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${vacancy.color}`}
                            >
                              {vacancy.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {vacancy.applicants}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="text-slate-400 hover:text-slate-600 p-1">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab Content - Reports */}
            {activeTab === "reports" && (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">
                      Reports Module
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      Analytics, statistics and detailed reports on the
                      recruitment process.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content - Configuration */}
            {activeTab === "configuration" && (
              <div className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <Settings className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">
                      System Configuration
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      Manage system settings, user roles and application
                      parameters.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content - Help */}
            {activeTab === "help" && (
              <div className="p-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900">Help Center</p>
                    <p className="text-sm text-purple-800 mt-1">
                      Documentation, FAQs and technical support for the ATS
                      system.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 py-6 border-t border-slate-200 text-center text-sm text-slate-600">
        <p>
          © 2026 ATS-UCE - Universidad Central del Ecuador. All rights reserved.
        </p>
      </div>
    </div>
  );
}
