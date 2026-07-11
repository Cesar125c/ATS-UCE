import {
  CheckCircle2,
  Clock3,
  Circle,
} from "lucide-react";

import Card from "../ui/Card";

const history = [
  {
    title: "HR Validation",
    date: "Completed · Oct 12, 2024",
    status: "completed",
  },
  {
    title: "Technical Interview",
    date: "Pending · Oct 15, 2024",
    status: "pending",
  },
  {
    title: "Authority Decision",
    date: "Awaiting signature",
    status: "current",
  },
];

export default function ProcessHistory() {
  return (
    <Card className="p-6 h-full">

      <h2 className="text-xl font-semibold mb-6">
        Process History
      </h2>

      <div className="space-y-6">

        {history.map((item) => (

          <div
            key={item.title}
            className="flex gap-4"
          >

            <div>

              {item.status === "completed" && (
                <CheckCircle2
                  size={18}
                  className="text-green-500"
                />
              )}

              {item.status === "current" && (
                <Clock3
                  size={18}
                  className="text-sky-500"
                />
              )}

              {item.status === "pending" && (
                <Circle
                  size={18}
                  className="text-slate-300"
                />
              )}

            </div>

            <div>

              <h3 className="font-medium">
                {item.title}
              </h3>

              <p className="text-sm text-slate-500">
                {item.date}
              </p>

            </div>

          </div>

        ))}

      </div>

    </Card>
  );
}
