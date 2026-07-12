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
    <Card className="p-6 h-full border border-slate-200 shadow-none">

      <div className="mb-6">

        <h2 className="text-lg font-semibold">
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
              className="flex gap-3"
            >

              <div className="w-8 h-8 rounded-full border border-[#2369ad] flex items-center justify-center flex-shrink-0">

                <Icon
                  size={16}
                  className="text-[#174f8d]"
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
