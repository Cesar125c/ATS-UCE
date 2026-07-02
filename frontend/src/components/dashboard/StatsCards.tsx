import { Users, TrendingUp, Clock3, CheckCircle2 } from "lucide-react";
import type { DashboardStats } from "@/services/dashboardService";

interface StatCardDef {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function buildStats(stats: DashboardStats | null): StatCardDef[] {
  const total = stats?.total_applicants ?? 0;
  const avg = stats?.avg_score ?? 0;
  const inProgress = stats?.in_progress ?? 0;
  const completed = stats?.completed ?? 0;
  const pct = total > 0 ? Math.round((inProgress / total) * 100) : 0;

  return [
    {
      title: "Total Postulantes",
      value: total.toLocaleString("es-EC"),
      description: "Postulaciones registradas",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Puntaje Promedio",
      value: `${Math.round(avg)}%`,
      description: "Promedio de puntajes IA",
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "En Proceso",
      value: inProgress.toLocaleString("es-EC"),
      description: `${pct}% del total de postulaciones`,
      icon: Clock3,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Seleccionados",
      value: completed.toLocaleString("es-EC"),
      description: "Evaluados exitosamente",
      icon: CheckCircle2,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];
}

interface StatsCardsProps {
  stats: DashboardStats | null;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = buildStats(stats);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">{card.value}</h2>
                <p className="mt-3 text-xs text-gray-400">{card.description}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon className={card.iconColor} size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
