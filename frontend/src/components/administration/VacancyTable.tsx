import Card from "../ui/Card";
import VacancyRow, { Vacancy } from "./VacancyRow";

const vacancies: Vacancy[] = [
  {
    id: "VAC-001",
    title: "Profesor de Inteligencia Artificial",
    faculty: "Ingeniería",
    type: "Tiempo Completo",
    status: "Activa",
    applicants: 45,
  },
  {
    id: "VAC-002",
    title: "Investigador de Biotecnología",
    faculty: "Ciencias de la Vida",
    type: "Medio Tiempo",
    status: "Pausada",
    applicants: 12,
  },
  {
    id: "VAC-003",
    title: "Docente de Cálculo Integral",
    faculty: "Matemáticas",
    type: "Tiempo Completo",
    status: "Activa",
    applicants: 38,
  },
  {
    id: "VAC-004",
    title: "Catedrático de Derecho Penal",
    faculty: "Jurisprudencia",
    type: "Tiempo Completo",
    status: "Cerrada",
    applicants: 89,
  },
  {
    id: "VAC-005",
    title: "Profesor de Diseño Gráfico",
    faculty: "Artes",
    type: "Por Horas",
    status: "Activa",
    applicants: 24,
  },
];

export default function VacancyTable() {
  return (
    <Card className="overflow-hidden p-0">

      <table className="w-full">

        <thead className="bg-slate-50 border-b">

          <tr className="text-left text-sm text-slate-600">

            <th className="px-6 py-4 font-semibold">
              ID
            </th>

            <th className="px-6 py-4 font-semibold">
              Título del Cargo
            </th>

            <th className="px-6 py-4 font-semibold">
              Facultad
            </th>

            <th className="px-6 py-4 font-semibold">
              Tipo
            </th>

            <th className="px-6 py-4 font-semibold">
              Estado
            </th>

            <th className="px-6 py-4 font-semibold text-center">
              Postulantes
            </th>

            <th className="px-6 py-4 font-semibold text-right">
              Acciones
            </th>

          </tr>

        </thead>

        <tbody>

          {vacancies.map((vacancy) => (

            <VacancyRow
              key={vacancy.id}
              vacancy={vacancy}
            />

          ))}

        </tbody>

      </table>

    </Card>
  );
}