import VacancyStatus from "./VacancyStatus";
import VacancyActions from "./VacancyActions";

export interface Vacancy {

  id: string;

  title: string;

  faculty: string;

  type: string;

  status: "Activa" | "Pausada" | "Cerrada";

  applicants: number;

}

interface VacancyRowProps {

  vacancy: Vacancy;

}

export default function VacancyRow({
  vacancy,
}: VacancyRowProps) {

  return (

    <tr className="border-b hover:bg-slate-50 transition-colors">

      <td className="px-6 py-5 font-medium text-slate-700">
        {vacancy.id}
      </td>

      <td className="px-6 py-5">

        <div>

          <h3 className="font-medium text-slate-800">
            {vacancy.title}
          </h3>

        </div>

      </td>

      <td className="px-6 py-5 text-slate-700">
        {vacancy.faculty}
      </td>

      <td className="px-6 py-5 text-slate-700">
        {vacancy.type}
      </td>

      <td className="px-6 py-5">

        <VacancyStatus
          status={vacancy.status}
        />

      </td>

      <td className="px-6 py-5 text-center font-semibold">
        {vacancy.applicants}
      </td>

      <td className="px-6 py-5 text-right">

        <VacancyActions />

      </td>

    </tr>

  );

}