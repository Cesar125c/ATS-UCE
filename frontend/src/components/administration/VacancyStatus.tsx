interface VacancyStatusProps {
  status: "Activa" | "Pausada" | "Cerrada";
}

export default function VacancyStatus({
  status,
}: VacancyStatusProps) {

  const styles = {
    Activa:
      "bg-green-100 text-green-700 border-green-200",

    Pausada:
      "bg-yellow-100 text-yellow-700 border-yellow-200",

    Cerrada:
      "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}