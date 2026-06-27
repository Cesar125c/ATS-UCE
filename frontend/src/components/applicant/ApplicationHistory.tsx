import Card from "../ui/Card";
import Badge from "../ui/Badge";

const applications = [
  {
    position: "Docente Investigador IA",
    faculty: "Facultad de Ingeniería",
    date: "12 May 2024",
    status: "Analizado IA",
    score: "88%",
  },
  {
    position: "Catedrático Economía",
    faculty: "Ciencias Administrativas",
    date: "08 May 2024",
    status: "Revisión RRHH",
    score: "92%",
  },
  {
    position: "Asistente de Cátedra",
    faculty: "Facultad de Filosofía",
    date: "28 Abr 2024",
    status: "Finalizado",
    score: "73%",
  },
];

export default function ApplicationHistory() {
  return (
    <Card className="p-6 mt-6">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-xl font-semibold">
          Historial de Postulaciones
        </h2>

        <button className="text-sky-600 text-sm font-medium">
          Ver todas
        </button>

      </div>

      <table className="w-full">

        <thead className="border-b">

          <tr className="text-left text-xs uppercase text-slate-500">

            <th className="py-3">Vacante</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Score IA</th>
            <th></th>

          </tr>

        </thead>

        <tbody>

          {applications.map((item) => (

            <tr
              key={item.position}
              className="border-b hover:bg-slate-50"
            >

              <td className="py-4">

                <p className="font-medium">
                  {item.position}
                </p>

                <p className="text-sm text-slate-500">
                  {item.faculty}
                </p>

              </td>

              <td>{item.date}</td>

              <td>

                <Badge>
                  {item.status}
                </Badge>

              </td>

              <td className="font-semibold">
                {item.score}
              </td>

              <td className="text-right">

                <button className="text-slate-500 hover:text-red-600">
                  →
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </Card>
  );
}