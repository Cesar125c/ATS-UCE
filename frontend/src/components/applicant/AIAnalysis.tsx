import {
  GraduationCap,
  BriefcaseBusiness,
  BookOpenCheck,
  BrainCircuit,
  UserCheck,
} from "lucide-react";
import Card from "../ui/Card";

const analysis = [
  {
    icon: GraduationCap,
    title: "Academic Training",
    description:
      "Degrees, postgraduate studies and official certifications.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Teaching Experience",
    description:
      "Years in roles, level and subjects taught.",
  },
  {
    icon: BookOpenCheck,
    title: "Scientific Production",
    description:
      "Publications, projects and indexed articles.",
  },
  {
    icon: BrainCircuit,
    title: "Languages & Competencies",
    description:
      "Language certifications and digital skills.",
  },
  {
    icon: UserCheck,
    title: "Profile Match",
    description:
      "Match with the vacancy requirements.",
  },
];

export default function AIAnalysis() {
  return (
    <Card className="p-6 h-full">

      <div className="mb-6">

        <h2 className="text-xl font-semibold">
          What does the AI analyze?
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Automated evaluation criteria.
        </p>

      </div>

      <div className="space-y-5">

        {analysis.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="flex gap-4"
            >

              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">

                <Icon
                  size={20}
                  className="text-sky-600"
                />

              </div>

              <div>

                <h3 className="font-semibold text-slate-800">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-500">
                  {item.description}
                </p>

              </div>

            </div>

          );

        })}

      </div>

    </Card>
  );
}
