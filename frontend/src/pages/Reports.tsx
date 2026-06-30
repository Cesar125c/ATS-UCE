import { useState, useEffect } from "react";
import { Users, TrendingUp, Clock3, CheckCircle2, BarChart3, PieChart, FileText } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import { getDashboardStats } from "@/services/dashboardService";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  PieChart as RePie,
  Pie,
  Cell,
} from "recharts";
import type { DashboardStats } from "@/services/dashboardService";

const COLORS = ["#dc2626", "#f59e0b", "#0ea5e9", "#22c55e"];

const trendData = [
  { month: "Ene", postulaciones: 32 },
  { month: "Feb", postulaciones: 48 },
  { month: "Mar", postulaciones: 56 },
  { month: "Abr", postulaciones: 44 },
  { month: "May", postulaciones: 63 },
  { month: "Jun", postulaciones: 81 },
];

export default function Reports() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getDashboardStats();
        if (!cancelled) setStats(data);
      } catch {
        // Report widgets can render their empty state if stats are unavailable.
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const pieData = stats
    ? [
        { name: "Completados", value: stats.completed },
        { name: "En Proceso", value: stats.in_progress },
        { name: "Rechazados", value: Math.max(0, stats.total_applicants - stats.in_progress - stats.completed) },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Reportes</h1>
        <p className="text-slate-500 mt-2">
          Estadísticas y métricas del proceso de selección docente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Postulantes", value: stats?.total_applicants ?? 0, icon: Users, color: "bg-blue-100 text-blue-600" },
          { label: "Puntaje Promedio", value: `${Math.round(stats?.avg_score ?? 0)}%`, icon: TrendingUp, color: "bg-green-100 text-green-600" },
          { label: "En Proceso", value: stats?.in_progress ?? 0, icon: Clock3, color: "bg-orange-100 text-orange-600" },
          { label: "Seleccionados", value: stats?.completed ?? 0, icon: CheckCircle2, color: "bg-purple-100 text-purple-600" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2">{card.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={20} className="text-red-600" />
            <h2 className="text-xl font-semibold">Tendencia de Postulaciones</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="postulaciones" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart size={20} className="text-red-600" />
            <h2 className="text-xl font-semibold">Distribución de Estados</h2>
          </div>
          <div className="h-80 flex items-center justify-center">
            {pieData.length > 0 && pieData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }: { name?: string; value?: number }) =>
                      `${name}: ${value}`
                    }
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePie>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-2">
                <FileText size={40} />
                <p>Sin datos suficientes</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Resumen Mensual</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="postulaciones" stroke="#dc2626" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </DashboardLayout>
  );
}
