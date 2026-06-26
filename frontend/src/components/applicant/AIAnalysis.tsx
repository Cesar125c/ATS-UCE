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
    title: "Formación Académica",
    description:
      "Títulos, posgrados y certificaciones oficiales.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Experiencia Docente",
    description:
      "Años en cargos, nivel y materias dictadas.",
  },
  {
    icon: BookOpenCheck,
    title: "Producción Científica",
    description:
      "Publicaciones, proyectos y artículos indexados.",
  },
  {
    icon: BrainCircuit,
    title: "Idiomas & Competencias",
    description:
      "Certificaciones de idiomas y habilidades digitales.",
  },
  {
    icon: UserCheck,
    title: "Adecuación al Perfil",
    description:
      "Coincidencia con los requisitos de la vacante.",
  },
];

export default function AIAnalysis() {
  return (
    <Card className="p-6 h-full">

      <div className="mb-6">

        <h2 className="text-xl font-semibold">
          ¿Qué analiza la IA?
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Criterios de evaluación automatizada.
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