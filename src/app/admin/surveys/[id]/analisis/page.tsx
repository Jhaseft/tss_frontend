"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type Question = {
  id: number;
  text: string;
  type: string;
  position: number;
  section?: string;
};

type CrossTabResult = {
  questionId1: number;
  questionText1: string;
  questionId2: number;
  questionText2: string;
  rowLabels: string[];
  colLabels: string[];
  observed: number[][];
  expected?: number[][];      // frecuencias esperadas E = (total fila × total columna) / n
  rowPct: number[][];
  rowTotals: number[];
  colTotals: number[];
  n: number;
  chiSquare: number;
  degreesOfFreedom: number;
  pValue: number;
  cramersV: number;
  significant: boolean;
  warning?: string;
  lowExpectedCells?: number;
  totalCells?: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORICAL = new Set([
  "SINGLE_NOMINAL", "SINGLE_ORDINAL", "MULTIPLE_CHOICE", "LIKERT", "MATRIX_LIKERT",
]);

function fmt(n: number, d = 4) { return n.toFixed(d); }

// Etiqueta de opción: los ítems de matriz Likert se marcan con 📊 y se muestran casi completos.
function optLabel(q: Question) {
  const prefix = q.type === "MATRIX_LIKERT" ? "📊 " : "";
  const t = q.text.length > 110 ? q.text.slice(0, 110) + "…" : q.text;
  return prefix + t;
}

function effectLabel(v: number) {
  if (v < 0.1) return { label: "Asociación trivial", color: "text-gray-500" };
  if (v < 0.3) return { label: "Asociación débil", color: "text-amber-600" };
  if (v < 0.5) return { label: "Asociación moderada", color: "text-orange-600" };
  return { label: "Asociación fuerte", color: "text-red-600" };
}

function pLabel(p: number) {
  if (p < 0.001) return "p < 0.001";
  if (p < 0.01) return "p < 0.01";
  if (p < 0.05) return "p < 0.05";
  return `p = ${fmt(p, 3)}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnalisisPage() {
  const params = useParams();
  const id = params?.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [q1, setQ1] = useState<string>("");
  const [q2, setQ2] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrossTabResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    // Preguntas categóricas + variables derivadas (recodificaciones, p. ej. el segmento de
    // experiencia a partir de "años de vida profesional"). Las derivadas llevan id negativo.
    type StatsQ = {
      questionId: number; text: string; type: string; position: number; section?: string;
      matrixItems?: { questionId: number; text: string }[];
    };
    Promise.all([
      api.get<{ questions: StatsQ[] }>(`/api/surveys/${id}/stats`),
      api.get<{ id: number; text: string; type: string }[]>(`/api/surveys/${id}/derived-variables`)
        .catch(() => []),
    ])
      .then(([stats, derived]) => {
        const cats: Question[] = [];
        for (const q of stats.questions) {
          if (!CATEGORICAL.has(q.type)) continue;
          // Las matrices Likert vienen agrupadas: se despliega cada ítem como una variable propia,
          // con su questionId real (el backend cruza ítems individuales, no el grupo).
          if (q.type === "MATRIX_LIKERT" && q.matrixItems?.length) {
            for (const it of q.matrixItems) {
              cats.push({ id: it.questionId, text: it.text, type: "MATRIX_LIKERT",
                position: q.position, section: q.text });
            }
          } else {
            cats.push({ id: q.questionId, text: q.text, type: q.type,
              position: q.position, section: q.section });
          }
        }
        const derivedVars: Question[] = (derived ?? []).map((d) => ({
          id: d.id, text: d.text, type: d.type, position: 10000, section: "Variables derivadas",
        }));
        setQuestions([...cats, ...derivedVars]);
      })
      .catch(() => setError("No se pudieron cargar las preguntas."));
  }, [id]);

  async function calculate() {
    if (!q1 || !q2 || q1 === q2) {
      setError("Selecciona dos preguntas distintas.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.post<CrossTabResult>(`/api/surveys/${id}/chi-square`, {
        questionId1: Number(q1),
        questionId2: Number(q2),
      });
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data ?? "Error al calcular. Verifica que ambas preguntas tengan respuestas.");
    } finally {
      setLoading(false);
    }
  }

  const effect = result ? effectLabel(result.cramersV) : null;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Análisis de asociación</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Cruce de variables categóricas · Prueba Chi-cuadrado de independencia
        </p>
      </div>

      {/* Selección de variables */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <p className="text-sm font-medium text-gray-700">Selecciona las dos variables a cruzar</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">Variable fila (V1)</label>
            <select
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">— Elige una pregunta —</option>
              {questions.map((q) => (
                <option key={q.id} value={String(q.id)} disabled={String(q.id) === q2}>
                  {optLabel(q)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">Variable columna (V2)</label>
            <select
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">— Elige una pregunta —</option>
              {questions.map((q) => (
                <option key={q.id} value={String(q.id)} disabled={String(q.id) === q1}>
                  {optLabel(q)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <button
          onClick={calculate}
          disabled={!q1 || !q2 || q1 === q2 || loading}
          className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Calculando…" : "Calcular χ²"}
        </button>
      </div>

      {/* Resultado */}
      {result && (
        <div className="space-y-6">

          {/* Warning */}
          {result.warning && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              ⚠ {result.warning}
            </div>
          )}

          {/* Estadísticos resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Chi-cuadrado</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(result.chiSquare, 3)}</p>
              <p className="text-xs text-gray-400 mt-0.5">gl = {result.degreesOfFreedom}</p>
            </div>
            <div className={`bg-white border rounded-xl px-5 py-4 ${result.significant ? "border-green-300" : "border-gray-200"}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">p-valor</p>
              <p className={`text-2xl font-bold mt-1 ${result.significant ? "text-green-700" : "text-gray-900"}`}>
                {pLabel(result.pValue)}
              </p>
              <p className={`text-xs mt-0.5 ${result.significant ? "text-green-600" : "text-gray-400"}`}>
                {result.significant ? "Dependencia significativa" : "Sin dependencia (α=0.05)"}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">V de Cramér</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(result.cramersV, 3)}</p>
              <p className={`text-xs mt-0.5 ${effect!.color}`}>{effect!.label}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">N observaciones</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{result.n}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {result.rowLabels.length} × {result.colLabels.length} celdas
              </p>
            </div>
          </div>

          {/* Tabla de contingencia */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Tabla de contingencia</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Filas: <span className="font-medium text-gray-700">
                  {result.questionText1.length > 70 ? result.questionText1.slice(0, 70) + "…" : result.questionText1}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Columnas: <span className="font-medium text-gray-700">
                  {result.questionText2.length > 70 ? result.questionText2.slice(0, 70) + "…" : result.questionText2}
                </span>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 min-w-36">V1 \ V2</th>
                    {result.colLabels.map((l, i) => (
                      <th key={i} className="text-center px-3 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">
                        {l.length > 20 ? l.slice(0, 20) + "…" : l}
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.rowLabels.map((row, r) => (
                    <tr key={r} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs font-medium text-gray-700 whitespace-nowrap">
                        {row.length > 28 ? row.slice(0, 28) + "…" : row}
                      </td>
                      {result.colLabels.map((_, c) => {
                        const exp = result.expected?.[r]?.[c];
                        const lowE = exp !== undefined && exp < 5;
                        return (
                          <td key={c} className="px-2 py-2 text-center">
                            <div
                              title={`Observada: ${result.observed[r][c]} · % fila: ${fmt(result.rowPct[r][c], 1)}%`}
                              className={`inline-flex flex-col items-center rounded-md px-2 py-1.5 min-w-14 border ${
                                lowE ? "bg-amber-50 border-amber-300" : "bg-gray-50 border-gray-200"}`}
                            >
                              <span className="text-sm font-bold text-gray-900">{result.observed[r][c]}</span>
                              {exp !== undefined && (
                                <span className={`text-xs ${lowE ? "text-amber-700" : "text-gray-400"}`}>
                                  E {fmt(exp, 1)}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 text-center text-xs font-bold text-gray-700">
                        {result.rowTotals[r]}
                      </td>
                    </tr>
                  ))}
                  {/* Totales columna */}
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td className="px-4 py-3 text-xs font-bold text-gray-700">Total</td>
                    {result.colTotals.map((t, c) => (
                      <td key={c} className="px-3 py-3 text-center text-xs font-bold text-gray-700">{t}</td>
                    ))}
                    <td className="px-3 py-3 text-center text-xs font-bold text-gray-900">{result.n}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="text-xs text-gray-600">
                Cada celda: <span className="font-semibold text-gray-900">conteo observado</span> ·{" "}
                <span className="text-gray-500">E = frecuencia esperada = (total fila × total columna) ÷ n</span>
              </span>
              <span className="text-xs text-amber-700 flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-3.5 rounded bg-amber-50 border border-amber-300" />
                E &lt; 5 (regla de Cochran)
                {result.lowExpectedCells !== undefined && result.totalCells !== undefined && (
                  <span className="text-gray-400"> · {result.lowExpectedCells}/{result.totalCells} celdas</span>
                )}
              </span>
              <span className="text-xs text-gray-400 ml-auto">% de fila disponible al pasar el cursor</span>
            </div>
          </div>

          {/* Interpretación */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-gray-900 mb-2">Interpretación automática</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {result.significant ? (
                <>
                  La prueba Chi-cuadrado indica que existe una <strong>asociación estadísticamente
                  significativa</strong> entre las dos variables (χ²({result.degreesOfFreedom}) ={" "}
                  {fmt(result.chiSquare, 3)}, {pLabel(result.pValue)}). La magnitud de la
                  asociación medida por la V de Cramér es{" "}
                  <strong className={effect!.color}>{effect!.label.toLowerCase()}</strong> (V ={" "}
                  {fmt(result.cramersV, 3)}). Se rechaza la hipótesis nula de independencia con
                  nivel de significancia α = 0.05.
                </>
              ) : (
                <>
                  La prueba Chi-cuadrado <strong>no detecta asociación significativa</strong> entre
                  las dos variables (χ²({result.degreesOfFreedom}) = {fmt(result.chiSquare, 3)},{" "}
                  {pLabel(result.pValue)}). No hay evidencia suficiente para rechazar la hipótesis
                  nula de independencia con nivel α = 0.05. La V de Cramér es{" "}
                  {fmt(result.cramersV, 3)} ({effect!.label.toLowerCase()}).
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
