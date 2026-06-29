import {
  GraduationCap,
  BriefcaseBusiness,
  BookOpenCheck,
  BrainCircuit,
  UserCheck,
  Award,
} from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import type { AIScoreDTO } from "@/types/application";

interface AxisDef {
  key: keyof AIScoreDTO;
  label: string;
  icon: React.ElementType;
  color: string;
}

const AXES: AxisDef[] = [
  { key: "academic_training", label: "Formación Académica", icon: GraduationCap, color: "bg-sky-500" },
  { key: "experience", label: "Experiencia Docente", icon: BriefcaseBusiness, color: "bg-emerald-500" },
  { key: "publications", label: "Producción Científica", icon: BookOpenCheck, color: "bg-violet-500" },
  { key: "profile_match", label: "Coincidencia con Vacante", icon: UserCheck, color: "bg-amber-500" },
  { key: "languages_competencies", label: "Idiomas y Competencias", icon: BrainCircuit, color: "bg-rose-500" },
];

const GRADE_VARIANT: Record<string, "green" | "blue" | "yellow" | "red"> = {
  EXCELLENT: "green",
  GOOD: "blue",
  ACCEPTABLE: "yellow",
  INSUFFICIENT: "red",
};

const GRADE_LABEL: Record<string, string> = {
  EXCELLENT: "Excelente",
  GOOD: "Buena",
  ACCEPTABLE: "Aceptable",
  INSUFFICIENT: "Insuficiente",
};

interface ScoreBreakdownProps {
  score: AIScoreDTO;
}

export default function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const gradeVariant = GRADE_VARIANT[score.grade] ?? "red";
  const gradeLabel = GRADE_LABEL[score.grade] ?? score.grade;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Resultado del Análisis IA</h2>
          <p className="text-sm text-slate-500 mt-1">
            Evaluación automatizada de tu perfil
          </p>
        </div>
        <div className="text-right">
          <Badge variant={gradeVariant} size="lg">
            <Award size={14} className="inline mr-1" />
            {gradeLabel}
          </Badge>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {Math.round(score.total)}%
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {AXES.map((axis) => {
          const Icon = axis.icon;
          const value = (score[axis.key] as number) || 0;

          return (
            <div key={axis.key}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon size={16} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {axis.label}
                </span>
                <span className="ml-auto text-sm font-semibold text-slate-900">
                  {Math.round(value)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${axis.color} transition-all duration-500`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {score.evaluation_summary && (
        <div className="mt-5 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600 italic">
            &ldquo;{score.evaluation_summary}&rdquo;
          </p>
        </div>
      )}
    </Card>
  );
}
