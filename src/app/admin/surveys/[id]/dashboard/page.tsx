"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { QuestionCard, QuestionStats } from "@/components/survey/QuestionCard";

type SurveyStats = {
  surveyId: number;
  surveyName: string;
  origin: string;
  totalResponses: number;
  questions: QuestionStats[];
};

const ORIGIN_LABEL: Record<string, string> = {
  MS_FORMS: "Microsoft Forms",
  GOOGLE_FORMS: "Google Forms",
  GENERIC: "Genérico",
};

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const params = useParams();
  const id = params?.id as string;

  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<string>("all");

  useEffect(() => {
    if (!id) return;
    api.get<SurveyStats>(`/api/surveys/${id}/stats`)
      .then(setStats)
      .catch(() => setError("No se pudo cargar el dashboard."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return <div className="p-8 text-sm text-red-600">{error ?? "Sin datos."}</div>;
  }

  const sections = ["all", ...Array.from(new Set(
    stats.questions.map((q) => q.section ?? "").filter(Boolean)
  ))];

  const filtered = section === "all"
    ? stats.questions
    : stats.questions.filter((q) => q.section === section);

  const catCount = stats.questions.filter((q) =>
    ["SINGLE_NOMINAL", "SINGLE_ORDINAL", "MULTIPLE_CHOICE", "LIKERT"].includes(q.type)
  ).length;

  const matrixCount = stats.questions.filter((q) => q.type === "MATRIX_LIKERT").length;

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total respuestas" value={stats.totalResponses} />
        <KpiCard label="Preguntas analizadas" value={stats.questions.length} />
        <KpiCard label="Categoricas / Likert" value={`${catCount + matrixCount}`} />
        <KpiCard
          label="Origen"
          value={ORIGIN_LABEL[stats.origin] ?? stats.origin}
          sub={stats.surveyName}
        />
      </div>

      {/* Filtro por sección */}
      {sections.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                section === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {s === "all" ? "Todas las secciones" : s}
            </button>
          ))}
        </div>
      )}

      {/* Pregunta por pregunta */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No hay preguntas en esta sección.</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((q) => (
            <div
              key={q.questionId}
              className={q.type === "MATRIX_LIKERT" ? "xl:col-span-2" : ""}
            >
              <QuestionCard q={q} />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-2">
        Resultados descriptivos y exploratorios · Muestreo por conveniencia
      </p>
    </div>
  );
}
