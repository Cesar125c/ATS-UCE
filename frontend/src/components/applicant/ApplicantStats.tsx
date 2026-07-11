import {
  Briefcase,
  ClipboardCheck,
  BrainCircuit,
} from "lucide-react";
import Card from "../ui/Card";

const stats = [
  {
    title: "Active Applications",
    value: "03",
    subtitle: "+1 this week",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Current Stage",
    value: "HR Review",
    subtitle: "",
    icon: ClipboardCheck,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    title: "Average AI Score",
    value: "88/100",
    subtitle: "Top 5% of candidates",
    icon: BrainCircuit,
    color: "bg-sky-100 text-sky-600",
  },
];

export default function ApplicantStats() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.title}
            className="p-6 flex items-center justify-between"
          >
            <div>

              <p className="text-sm text-slate-500">
                {stat.title}
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {stat.value}
              </h3>

              {stat.subtitle && (
                <p className="text-xs text-slate-400 mt-1">
                  {stat.subtitle}
                </p>
              )}

            </div>

            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
            >
              <Icon size={22} />
            </div>

          </Card>
        );
      })}

    </div>
  );
}
