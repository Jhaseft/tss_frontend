"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

type Question = { questionId: number; text: string; type: string };

type HistoBin = { midpoint: number; count: number };

type OptionResult = {
  label: string;
  estimate: number;
  ciLow95: number;
  ciHigh95: number;
  histogram: HistoBin[];
};

type SimResult = {
  questionText: string;
  questionType: string;
  simulationType: "BOOTSTRAP_MEAN" | "BOOTSTRAP_PROPORTION";
  iterations: number;
  n: number;
  estimate?: number;
  ciLow95?: number;
  ciHigh95?: number;
  stdError?: number;
  histogram?: HistoBin[];
  optionResults?: OptionResult[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const SIM_TYPES = new Set([
  "SINGLE_NOMINAL", "SINGLE_ORDINAL", "MULTIPLE_CHOICE",
  "LIKERT", "MATRIX_LIKERT", "NUMERIC",
]);

function fmt(n: number | undefined, d = 3) {
  return n == null ? "—" : n.toFixed(d);
}

function pct(n: number | undefined) {
  return n == null ? "—" : (n * 100).toFixed(1) + "%";
}

// ── Componente histograma ──────────────────────────────────────────────────────

function BootstrapHistogram({
  data, estimate, low, high, label,
}: {
  data: HistoBin[]; estimate: number; low: number; high: number; label: string;
}) {
  const chartData = data.map((b) => ({ x: +b.midpoint.toFixed(4), y: b.count }));
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-medium text-gray-700 mb-1 truncate">{label}</p>
      <p className="text-xs text-gray-400 mb-3">
        Estimación: <strong className="text-gray-800">{fmt(estimate)}</strong>
        {" · "}IC 95%: [{fmt(low)}, {fmt(high)}]
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={chartData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="x" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v) => [Number(v ?? 0), "iteraciones"]}
            labelFormatter={(v) => `~${Number(v).toFixed(3)}`}
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
          />
          <Bar dataKey="y" fill="#374151" radius={[2, 2, 0, 0]} />
          <ReferenceLine x={+estimate.toFixed(4)} stroke="#1d4ed8" strokeWidth={2} label={{ value: "x̄", position: "top", fontSize: 10, fill: "#1d4ed8" }} />
          <ReferenceLine x={+low.toFixed(4)} stroke="#ef4444" strokeDasharray="4 4" />
          <ReferenceLine x={+high.toFixed(4)} stroke="#ef4444" strokeDasharray="4 4" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-1 text-center">Distribución bootstrap · línea azul = estimación · rojas = IC 95%</p>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function SimulacionPage() {
  const params = useParams();
  const id = params?.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQ, setSelectedQ] = useState<string>("");
  const [iterations, setIterations] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<{ questions: Question[] }>(`/api/surveys/${id}/stats`)
      .then((data: any) => {
        const valid = (data.questions as Question[]).filter((q) => SIM_TYPES.has(q.type));
        setQuestions(valid);
      })
      .catch(() => setError("No se pudieron cargar las preguntas."));
  }, [id]);

  async function run() {
    if (!selectedQ) { setError("Selecciona una pregunta."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.post<SimResult>(`/api/surveys/${id}/simulate`, {
        questionId: Number(selectedQ),
        iterations,
      });
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data ?? "Error al ejecutar la simulación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Simulación Bootstrap</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Remuestreo con reemplazo para estimar intervalos de confianza al 95% sobre proporciones y medias.
        </p>
      </div>

      {/* Configuración */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <p className="text-sm font-medium text-gray-700">Configuración de la simulación</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 font-medium block mb-1.5">Variable</label>
            <select
              value={selectedQ}
              onChange={(e) => { setSelectedQ(e.target.value); setResult(null); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">— Elige una pregunta —</option>
              {questions.map((q) => (
                <option key={q.questionId} value={String(q.questionId)}>
                  {q.text.length > 90 ? q.text.slice(0, 90) + "…" : q.text}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">
              Iteraciones: <strong className="text-gray-800">{iterations.toLocaleString()}</strong>
            </label>
            <input
              type="range" min={200} max={5000} step={200}
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full accent-gray-800"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>200</span><span>5 000</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
        )}

        <button
          onClick={run}
          disabled={!selectedQ || loading}
          className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Ejecutando…" : "Ejecutar bootstrap"}
        </button>
      </div>

      {/* Resultado */}
      {result && (
        <div className="space-y-6">

          {/* Cabecera */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 sm:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Variable</p>
              <p className="text-sm font-semibold text-gray-900 mt-1 leading-snug line-clamp-2">
                {result.questionText}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {result.simulationType === "BOOTSTRAP_MEAN" ? "Bootstrap media" : "Bootstrap proporciones"}
                {" · "}{result.iterations.toLocaleString()} iteraciones · n = {result.n}
              </p>
            </div>
            {result.simulationType === "BOOTSTRAP_MEAN" && (
              <>
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Media estimada</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(result.estimate, 3)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">SE = {fmt(result.stdError, 3)}</p>
                </div>
                <div className="bg-white border border-green-300 rounded-xl px-5 py-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">IC 95%</p>
                  <p className="text-lg font-bold text-green-700 mt-1">
                    [{fmt(result.ciLow95, 3)}, {fmt(result.ciHigh95, 3)}]
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Percentiles 2.5 – 97.5</p>
                </div>
              </>
            )}
          </div>

          {/* Histogramas */}
          {result.simulationType === "BOOTSTRAP_MEAN" && result.histogram && (
            <BootstrapHistogram
              data={result.histogram}
              estimate={result.estimate!}
              low={result.ciLow95!}
              high={result.ciHigh95!}
              label="Distribución bootstrap de la media"
            />
          )}

          {result.simulationType === "BOOTSTRAP_PROPORTION" && result.optionResults && (
            <>
              {/* Tabla resumen */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Intervalos de confianza por opción (95%)</p>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Opción</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Proporción</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">IC 95% inferior</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">IC 95% superior</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500">Intervalo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.optionResults.map((o) => (
                      <tr key={o.label} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-700 font-medium">{o.label}</td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-900">{pct(o.estimate)}</td>
                        <td className="px-5 py-3 text-right text-gray-600">{pct(o.ciLow95)}</td>
                        <td className="px-5 py-3 text-right text-gray-600">{pct(o.ciHigh95)}</td>
                        <td className="px-5 py-3">
                          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden w-full min-w-24">
                            <div
                              className="absolute h-full bg-gray-800 rounded-full"
                              style={{ left: `${o.ciLow95 * 100}%`, width: `${(o.ciHigh95 - o.ciLow95) * 100}%` }}
                            />
                            <div
                              className="absolute h-full w-0.5 bg-blue-500"
                              style={{ left: `${o.estimate * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>

              {/* Histogramas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.optionResults.map((o) => (
                  <BootstrapHistogram
                    key={o.label}
                    data={o.histogram}
                    estimate={o.estimate}
                    low={o.ciLow95}
                    high={o.ciHigh95}
                    label={o.label}
                  />
                ))}
              </div>
            </>
          )}

          <p className="text-xs text-gray-400 text-center">
            Bootstrap no paramétrico · {result.iterations.toLocaleString()} remuestras · IC percentil
          </p>
        </div>
      )}
    </div>
  );
}
