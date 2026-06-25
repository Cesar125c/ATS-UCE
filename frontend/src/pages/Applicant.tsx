import { useState } from "react";
import { useClerk } from "@clerk/react";
import {
  Menu,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

const applicantInfo = {
  activeApplications: 3,
  status: "Under Review",
  score: 92,
  applications: [
    {
      id: 1,
      position: "Artificial Intelligence Professor",
      date: "2024-06-18",
      status: "active",
      stage: "AI Evaluation",
    },
    {
      id: 2,
      position: "Software Engineering Researcher",
      date: "2024-06-10",
      status: "reviewing",
      stage: "HR Review",
    },
    {
      id: 3,
      position: "Data Science Instructor",
      date: "2024-06-05",
      status: "completed",
      stage: "Completed",
    },
  ],
};

export default function Applicant() {
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="text-xl font-bold text-blue-600">ATS-UCE</div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search application..."
              className="hidden md:block px-4 py-2 bg-gray-100 rounded text-sm focus:outline-none"
            />
            <button className="p-2 hover:bg-gray-100 rounded">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <button className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center">
              J
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-64 bg-white border-r border-gray-200 min-h-screen`}
        >
          <nav className="p-6 space-y-2">
            <a
              href="#"
              className="block px-4 py-2 text-blue-600 bg-blue-50 rounded font-medium"
            >
              🏠 Home
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded"
            >
              📋 CV Applications
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded"
            >
              📧 Inbox
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded"
            >
              👤 Profile
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded"
            >
              ❓ Help
            </a>
            <hr className="my-4" />
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium"
            >
              🚪 Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Applicant Portal
          </h1>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Active Applications</p>
              <p className="text-3xl font-bold text-gray-900">
                {applicantInfo.activeApplications}
              </p>
              <p className="text-gray-500 text-xs mt-2">Upload your CV...</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Current Status</p>
              <p className="text-2xl font-bold text-blue-600">
                {applicantInfo.status}
              </p>
              <p className="text-gray-500 text-xs mt-2">Top 5% applicants</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Evaluation Score</p>
              <p className="text-3xl font-bold text-gray-900">
                {applicantInfo.score}
              </p>
              <p className="text-gray-500 text-xs mt-2">Top 5% applicants</p>
            </div>
          </div>

          {/* CV Upload Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Upload Your Curriculum Vitae
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
              <Download className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-gray-600">Drag your file or click to select</p>
              <p className="text-gray-500 text-sm">PDF, DOC, DOCX (max. 5MB)</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Select file
              </button>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                What does AI analyze?
              </h2>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Academic Training
                    </p>
                    <p className="text-gray-600 text-sm">
                      Titles, degree and certifications
                    </p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Teaching Experience
                    </p>
                    <p className="text-gray-600 text-sm">
                      Years, role and competence
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Your Application Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle className="text-green-500" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Received</p>
                    <p className="text-gray-600 text-sm">
                      Your application was received
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="text-yellow-500" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Under Review</p>
                    <p className="text-gray-600 text-sm">
                      Your profile is being evaluated
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applications History */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Application History
              </h2>
              <button className="text-blue-600 text-sm hover:underline">
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      VACANCY / POSITION
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      DATE
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      STATUS
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      STAGE
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applicantInfo.applications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {app.position}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{app.date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            app.status === "active"
                              ? "bg-green-100 text-green-700"
                              : app.status === "reviewing"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {app.status === "active"
                            ? "Active"
                            : app.status === "reviewing"
                              ? "Under Review"
                              : "Completed"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{app.stage}</td>
                      <td className="py-3 px-4">
                        <button className="text-blue-600 hover:underline text-xs">
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mt-8">
            <div className="flex gap-4">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">Need help?</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Contact us through our help center. We will answer your
                  question as soon as possible.
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold text-sm flex-shrink-0">
                Contact
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-gray-600 text-sm border-t border-gray-200 pt-6">
            <p>© 2026 ATS-UCE - Central University of Ecuador</p>
          </footer>
        </main>
      </div>
    </div>
  );
}