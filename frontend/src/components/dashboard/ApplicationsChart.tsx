import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../ui/Card";
import { useApplicationTrend } from "@/hooks/useAppQueries";

export default function ApplicationsChart() {
  const { data: trend } = useApplicationTrend();
  const chartData = trend?.length ? trend.map((d) => ({
    period: d.period,
    applications: d.applications,
  })) : [];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Applications Last 8 Weeks</h2>
        <p className="text-sm text-slate-500 mt-1">Weekly recruitment activity.</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="applications" stroke="#dc2626" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
