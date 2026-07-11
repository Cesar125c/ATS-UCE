import { useState } from "react";
import {
  Briefcase,
  FileBarChart,
  Settings,
  CircleHelp,
} from "lucide-react";

const tabs = [
  { id: "vacancies", title: "Vacancies", icon: Briefcase },
  { id: "reports", title: "Reports", icon: FileBarChart },
  { id: "configuration", title: "Configuration", icon: Settings },
  { id: "help", title: "Help Center", icon: CircleHelp },
];

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState("vacancies");

  return (
    <div className="bg-white border rounded-xl p-2 mb-8">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-slate-50 shadow-sm border"
                  : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              <Icon size={18} />
              {tab.title}
            </button>
          );
        })}
      </div>

      {activeTab !== "vacancies" && (
        <p className="text-slate-400 text-sm px-4 pt-4 pb-2">
          {activeTab === "reports" && "Reports view — coming soon."}
          {activeTab === "configuration" && "Configuration — coming soon."}
          {activeTab === "help" && "Help Center — coming soon."}
        </p>
      )}
    </div>
  );
}
