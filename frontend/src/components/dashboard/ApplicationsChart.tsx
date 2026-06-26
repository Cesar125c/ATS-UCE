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

const data = [
  { month: "Jan", applications: 32 },
  { month: "Feb", applications: 48 },
  { month: "Mar", applications: 56 },
  { month: "Apr", applications: 44 },
  { month: "May", applications: 63 },
  { month: "Jun", applications: 81 },
  { month: "Jul", applications: 75 },
];

export default function ApplicationsChart() {
  return (
    <Card className="p-6">

      <div className="mb-6">

        <h2 className="text-xl font-semibold">
          Monthly Applications
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Recruitment activity during the last months.
        </p>

      </div>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="applications"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ r: 5 }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </Card>
  );
}