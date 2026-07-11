import {
  Briefcase,
  FileBarChart,
  Settings,
  CircleHelp,
} from "lucide-react";

const tabs = [
  {
    title: "Vacancies",
    icon: Briefcase,
    active: true,
  },
  {
    title: "Reports",
    icon: FileBarChart,
    active: false,
  },
  {
    title: "Configuration",
    icon: Settings,
    active: false,
  },
  {
    title: "Help Center",
    icon: CircleHelp,
    active: false,
  },
];

export default function AdminTabs() {
  return (
    <div className="bg-white border rounded-xl p-2 mb-8">

      <div className="flex flex-wrap gap-2">

        {tabs.map((tab) => {

          const Icon = tab.icon;

          return (

            <button
              key={tab.title}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                tab.active
                  ? "bg-slate-50 shadow-sm border"
                  : "hover:bg-slate-100"
              }`}
            >

              <Icon size={18} />

              {tab.title}

            </button>

          );

        })}

      </div>

    </div>
  );
}
