"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ErrorBar,
} from "recharts";

// ── Tipos ───────────────────────────────────────────────────────────────────────

type Survey = { id: number; name: string };
type Question = { id: number; text: string; type: string };
type Row = {
  label: string;
  countA: number; pctA: number; ciLowA: number; ciHighA: number;
  countB: number; pctB: number; ciLowB: number; ciHighB: number;
  gap: number;
};
type CompareResult = {
  mode: string;
  surveyNameA: string; questionTextA: string; nA: number;
  surveyNameB: string; questionTextB: string; nB: number;
  rows: Row[];
  disclaimer: string;
};

const CAT_TYPES = new Set(["SINGLE_NOMINAL", "SINGLE_ORDINAL", "MULTIPLE_CHOICE"]);
const KW_TYPES = new Set(["TEXT_LONG", "MULTIPLE_CHOICE"]);

function f(n: number, d = 1) { return n.toFixed(d).replace(".", ","); }
function short(s: string, n = 60) { return s.length > n ? s.slice(0, n) + "…" : s; }

// ── Componente ──────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [mode, setMode] = useState("CATEGORIES");

  const [surveyA, setSurveyA] = useState("");
  const [surveyB, setSurveyB] = useState("");
  const [questionsA, setQuestionsA] = useState<Question[]>([]);
  const [questionsB, setQuestionsB] = useState<Question[]>([]);
  const [qa, setQa] = useState("");
  const [qb, setQb] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Survey[]>("/api/surveys")
      .then((s) => {
        setSurveys(s);
        if (s[0]) setSurveyA(String(s[0].id));
        if (s[1]) setSurveyB(String(s[1].id));
      })
      .catch(() => setError("No se pudieron cargar las encuestas."));
  }, []);

  function loadQuestions(surveyId: string, setter: (q: Question[]) => void) {
    if (!surveyId) { setter([]); return; }
    api.get<{ questions: any[] }>(`/api/surveys/${surveyId}/stats`)
      .then((d) => setter(d.questions.map((q) => ({ id: q.questionId, text: q.text, type: q.type }))))
      .catch(() => setter([]));
  }
  useEffect(() => { loadQuestions(surveyA, setQuestionsA); setQa(""); }, [surveyA]);
  useEffect(() => { loadQuestions(surveyB, setQuestionsB); setQb(""); }, [surveyB]);

  const allowed = mode === "KEYWORDS" ? KW_TYPES : CAT_TYPES;
  const filteredA = questionsA.filter((q) => allowed.has(q.type));
  const filteredB = questionsB.filter((q) => allowed.has(q.type));

  async function calculate() {
    if (!qa || !qb) { setError("Selecciona una pregunta de cada encuesta."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await api.post<CompareResult>("/api/compare", {
        questionIdA: Number(qa), questionIdB: Number(qb), mode,
      });
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data ?? "Error al comparar.");
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.rows.slice(0, 14).map((r) => ({
      label: short(r.label, 22),
      A: Number(r.pctA.toFixed(2)),
      B: Number(r.pctB.toFixed(2)),
      errA: [r.pctA - r.ciLowA, r.ciHighA - r.pctA],
      errB: [r.pctB - r.ciLowB, r.ciHighB - r.pctB],
    }));
  }, [result]);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Comparativo entre encuestas</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Demanda vs. oferta · dos muestras independientes con IC de Wilson 95 %
        </p>
      </div>

      {/* Aviso metodológico permanente */}
      <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <strong>No es un cruce ni un χ².</strong> Titulados y empleadores son encuestados distintos; aquí
        se comparan dos distribuciones separadas. Las diferencias son descriptivas, no inferenciales.
      </div>

      {/* Configuración */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex gap-2">
          {["CATEGORIES", "KEYWORDS"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setResult(null); }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                mode === m ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              {m === "CATEGORIES" ? "Por categorías" : "Por temas (texto libre)"}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 -mt-1">
          {mode === "CATEGORIES"
            ? "Alinea categorías por etiqueta (mismo constructo, p. ej. medio de reclutamiento)."
            : "Compara la prevalencia de temas comunes (IA, Ciberseguridad, Datos…) en texto libre."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Lado A */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Encuesta A</p>
            <Picker label="Encuesta" value={surveyA} onChange={setSurveyA}
              options={surveys.map((s) => ({ id: s.id, text: s.name }))} />
            <Picker label="Pregunta" value={qa} onChange={setQa}
              options={filteredA.map((q) => ({ id: q.id, text: q.text }))} />
          </div>
          {/* Lado B */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Encuesta B</p>
            <Picker label="Encuesta" value={surveyB} onChange={setSurveyB}
              options={surveys.map((s) => ({ id: s.id, text: s.name }))} />
            <Picker label="Pregunta" value={qb} onChange={setQb}
              options={filteredB.map((q) => ({ id: q.id, text: q.text }))} />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
        )}

        <button onClick={calculate} disabled={!qa || !qb || loading}
          className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? "Comparando…" : "Comparar"}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">A · {result.surveyNameA}</p>
              <p className="text-sm text-gray-700 mt-1">{short(result.questionTextA, 80)}</p>
              <p className="text-xs text-gray-400 mt-1">n = {result.nA}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide">B · {result.surveyNameB}</p>
              <p className="text-sm text-gray-700 mt-1">{short(result.questionTextB, 80)}</p>
              <p className="text-xs text-gray-400 mt-1">n = {result.nB}</p>
            </div>
          </div>

          {/* Barras agrupadas con IC de Wilson */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-gray-900 mb-4">% por categoría (barras de error = IC 95 % de Wilson)</p>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 70, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} angle={-30}
                  textAnchor="end" height={90} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} unit="%" />
                <Tooltip formatter={(v: any) => `${f(Number(v))} %`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="A" name={`A · ${result.surveyNameA}`} fill="#2563eb" fillOpacity={0.85}>
                  <ErrorBar dataKey="errA" width={4} strokeWidth={1} stroke="#1e3a8a" direction="y" />
                </Bar>
                <Bar dataKey="B" name={`B · ${result.surveyNameB}`} fill="#e11d48" fillOpacity={0.85}>
                  <ErrorBar dataKey="errB" width={4} strokeWidth={1} stroke="#881337" direction="y" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                    <th className="text-left px-4 py-3 font-semibold">Categoría / Tema</th>
                    <th className="text-right px-3 py-3 font-semibold text-blue-700">A · % [IC 95 %]</th>
                    <th className="text-right px-3 py-3 font-semibold text-rose-700">B · % [IC 95 %]</th>
                    <th className="text-right px-3 py-3 font-semibold">Brecha (pp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.rows.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-800">{r.label}</td>
                      <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">
                        {f(r.pctA)}% <span className="text-gray-400">[{f(r.ciLowA)}; {f(r.ciHighA)}]</span>
                        <span className="text-gray-400"> · {r.countA}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">
                        {f(r.pctB)}% <span className="text-gray-400">[{f(r.ciLowB)}; {f(r.ciHighB)}]</span>
                        <span className="text-gray-400"> · {r.countB}</span>
                      </td>
                      <td className={`px-3 py-2.5 text-right font-medium ${
                        r.gap > 0 ? "text-blue-700" : r.gap < 0 ? "text-rose-700" : "text-gray-500"}`}>
                        {r.gap > 0 ? "+" : ""}{f(r.gap)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-gray-400">{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}

// ── Subcomponente ────────────────────────────────────────────────────────────────

function Picker({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { id: number; text: string }[];
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 font-medium block mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300">
        <option value="">— Elige —</option>
        {options.map((o) => (
          <option key={o.id} value={String(o.id)}>{short(o.text, 70)}</option>
        ))}
      </select>
    </div>
  );
}
