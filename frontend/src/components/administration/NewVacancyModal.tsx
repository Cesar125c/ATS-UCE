import { useState } from "react";
import {
  X,
  Save,
  Briefcase,
  Building2,
  Clock3,
  FileText,
} from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";

interface NewVacancyModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (vacancy: VacancyForm) => void;
}

export interface VacancyForm {
  title: string;
  faculty: string;
  type: string;
  vacancies: number;
  salary: string;
  deadline: string;
  description: string;
}

export default function NewVacancyModal({
  open,
  onClose,
  onSave,
}: NewVacancyModalProps) {
  const [form, setForm] = useState<VacancyForm>({
    title: "",
    faculty: "",
    type: "",
    vacancies: 1,
    salary: "",
    deadline: "",
    description: "",
  });

  if (!open) return null;

  const updateField = (
    field: keyof VacancyForm,
    value: string | number
  ) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSave = () => {
    onSave?.(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <Card className="w-full max-w-3xl p-0 overflow-hidden">

        {/* HEADER */}

        <div className="flex justify-between items-center border-b px-6 py-5">

          <div>

            <h2 className="text-2xl font-bold">
              Nueva Vacante
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Complete la información para publicar una nueva vacante.
            </p>

          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={22} />
          </button>

        </div>

        {/* BODY */}

        <div className="p-6 space-y-6">

          <div className="grid md:grid-cols-2 gap-5">

            {/* Cargo */}

            <div>

              <label className="text-sm font-medium mb-2 block">
                Cargo
              </label>

              <div className="relative">

                <Briefcase
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Profesor de IA"
                  value={form.title}
                  onChange={(e) =>
                    updateField("title", e.target.value)
                  }
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                />

              </div>

            </div>

            {/* Facultad */}

            <div>

              <label className="text-sm font-medium mb-2 block">
                Facultad
              </label>

              <div className="relative">

                <Building2
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <select
                  value={form.faculty}
                  onChange={(e) =>
                    updateField("faculty", e.target.value)
                  }
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                >

                  <option value="">
                    Seleccione...
                  </option>

                  <option>
                    Ingeniería
                  </option>

                  <option>
                    Ciencias de la Vida
                  </option>

                  <option>
                    Jurisprudencia
                  </option>

                  <option>
                    Economía
                  </option>

                  <option>
                    Artes
                  </option>

                </select>

              </div>

            </div>

            {/* Tipo */}

            <div>

              <label className="text-sm font-medium mb-2 block">
                Tipo de Contrato
              </label>

              <div className="relative">

                <Clock3
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <select
                  value={form.type}
                  onChange={(e) =>
                    updateField("type", e.target.value)
                  }
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                >

                  <option value="">
                    Seleccione...
                  </option>

                  <option>
                    Tiempo Completo
                  </option>

                  <option>
                    Medio Tiempo
                  </option>

                  <option>
                    Por Horas
                  </option>

                </select>

              </div>

            </div>

            {/* Vacantes */}

            <div>

              <label className="text-sm font-medium mb-2 block">
                Número de Vacantes
              </label>

              <input
                type="number"
                min={1}
                value={form.vacancies}
                onChange={(e) =>
                  updateField(
                    "vacancies",
                    Number(e.target.value)
                  )
                }
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
              />

            </div>

            {/* Salario */}

            <div>

              <label className="text-sm font-medium mb-2 block">
                Salario Referencial
              </label>

              <input
                type="text"
                placeholder="$ 2.500"
                value={form.salary}
                onChange={(e) =>
                  updateField("salary", e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
              />

            </div>

            {/* Fecha */}

            <div>

              <label className="text-sm font-medium mb-2 block">
                Fecha límite
              </label>

              <input
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  updateField("deadline", e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
              />

            </div>

          </div>

          {/* Descripción */}

          <div>

            <label className="text-sm font-medium mb-2 block">
              Descripción
            </label>

            <div className="relative">

              <FileText
                size={18}
                className="absolute left-3 top-4 text-slate-400"
              />

              <textarea
                rows={6}
                placeholder="Describa el perfil requerido..."
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                className="w-full border rounded-lg pl-10 pr-4 py-3 resize-none focus:ring-2 focus:ring-red-500 outline-none"
              />

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="border-t px-6 py-5 flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            onClick={handleSave}
          >

            <Save size={18} />

            Guardar Vacante

          </Button>

        </div>

      </Card>

    </div>
  );
}