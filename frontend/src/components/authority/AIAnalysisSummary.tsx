import {
  GraduationCap,
  BookOpen,
  Languages,
  FlaskConical,
} from "lucide-react";

import Card from "../ui/Card";

const scores = [
  {
    title: "Formación Académica",
    value: 98,
    icon: GraduationCap,
  },
  {
    title: "Experiencia Docente",
    value: 92,
    icon: BookOpen,
  },
  {
    title: "Producción Científica",
    value: 95,
    icon: FlaskConical,
  },
  {
    title: "Idiomas",
    value: 85,
    icon: Languages,
  },
];

export default function AIAnalysisSummary() {
  return (
    <Card className="p-6 h-full">

      <h2 className="text-xl font-semibold mb-2">
        Resumen de Análisis IA
      </h2>

      <p className="italic text-sm text-slate-600 mb-8">
        "Candidato con excepcional trayectoria en investigación.
        Supera los estándares institucionales en producción
        científica y años de experiencia docente universitaria."
      </p>

      <div className="space-y-6">

        {scores.map((item) => {

          const Icon = item.icon;

          return (

            <div key={item.title}>

              <div className="flex justify-between mb-2">

                <div className="flex gap-2 items-center">

                  <Icon
                    size={18}
                    className="text-slate-600"
                  />

                  <span className="text-sm font-medium">
                    {item.title}
                  </span>

                </div>

                <span className="font-semibold text-sky-600">
                  {item.value}%
                </span>

              </div>

              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">

                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{
                    width: `${item.value}%`,
                  }}
                />

              </div>

            </div>

          );

        })}

      </div>

    </Card>
  );
}