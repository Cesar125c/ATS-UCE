import {
  Users,
  TrendingUp,
  Clock3,
  CheckCircle2,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  bg: string;
  iconBg: string;
  iconColor: string;
}

const stats: StatCard[] = [
  {
    title: "Total Applicants",
    value: "1,248",
    description: "+12% compared to last month",
    icon: Users,
    bg: "bg-white",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Average Score",
    value: "84%",
    description: "+5% compared to last month",
    icon: TrendingUp,
    bg: "bg-white",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "In Process",
    value: "842",
    description: "67% of total applications",
    icon: Clock3,
    bg: "bg-white",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Completed",
    value: "406",
    description: "Successfully evaluated",
    icon: CheckCircle2,
    bg: "bg-white",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

export default function StatsCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {stats.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`${card.bg} rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all`}
          >
            <div className="flex justify-between items-start">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {card.value}
                </h2>

                <p className="mt-3 text-xs text-gray-400">
                  {card.description}
                </p>

              </div>

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}
              >
                <Icon
                  className={card.iconColor}
                  size={22}
                />
              </div>

            </div>
          </div>
        );
      })}
    </section>
  );
}