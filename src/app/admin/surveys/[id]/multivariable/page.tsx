"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, ZAxis,
} from "recharts";

// ── Tipos (espejo del backend) ─────────────────────────────────────────────────

type Question = { id: number; text: string; type: string; position: number };

type Cell = {
  x: string; y: string; n: number; pct: number;
  meanZ: number | null; medianZ: number | null; stdDevZ: number | null;
  minZ: number | null; maxZ: number | null;
};
type Marginal = {
  label: string; n: number; pct: number;
  meanZ: number | null; medianZ: number | null; stdDevZ: number | null;
};
type Point = { x: string; y: string; z: number };
type MultivariateResult = {
  questionTextX: string; questionTextY: string; questionTextZ: string;
  xLabels: string[]; yLabels: string[];
  cells: Cell[]; marginalX: Marginal[]; marginalY: Marginal[];
  total: Marginal; points: Point[];
  usedN: number; excluded: Record<string, number>;
};

// ── Helpers ─────────────────────────────────────────────────────────────────────

const QUALITATIVE = new Set(["SINGLE_NOMINAL", "SINGLE_ORDINAL", "LIKERT"]);
const PALETTE = ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed",
  "#0891b2", "#db2777", "#65a30d", "#9333ea", "#0d9488"];

function f(n: number | null | undefined, d = 2) {
  return n === null || n === undefined ? "—" : n.toFixed(d).replace(".", ",");
}
function short(s: string, n = 24) { return s.length > n ? s.slice(0, n) + "…" : s; }

// ── Componente ──────────────────────────────────────────────────────────────────

export default function MultivariablePage() {
  const params = useParams();
  const id = params?.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [qx, setQx] = useState("");
  const [qy, setQy] = useState("");
  const [qz, setQz] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MultivariateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qualitative = questions.filter((q) => QUALITATIVE.has(q.type));
  const numeric = questions.filter((q) => q.type === "NUMERIC");

  useEffect(() => {
    if (!id) return;
    api.get<{ questions: Question[] }>(`/api/surveys/${id}/stats`)
      .then((data) => setQuestions(
        data.questions.map((q: any) => ({
          id: q.questionId, text: q.text, type: q.type, position: q.position,
        }))))
      .catch(() => setError("No se pudieron cargar las preguntas."));
  }, [id]);

  async function calculate() {
    if (!qx || !qy || !qz || qx === qy) {
      setError("Selecciona X e Y (distintas) y una Z numérica.");
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await api.post<MultivariateResult>(`/api/surveys/${id}/multivariate`, {
        questionIdX: Number(qx), questionIdY: Number(qy), questionIdZ: Number(qz),
      });
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data ?? "Error al calcular el cruce multivariable.");
    } finally {
      setLoading(false);
    }
  }

  const cellMap = useMemo(() => {
    const m = new Map<string, Cell>();
    result?.cells.forEach((c) => m.set(c.x + "||" + c.y, c));
    return m;
  }, [result]);

  // Dispersión categorizada: X = índice de categoría + jitter, Y = Z, color = categoría de Y.
  const scatterSeries = useMemo(() => {
    if (!result) return [];
    return result.yLabels.map((y, yi) => ({
      name: y,
      color: PALETTE[yi % PALETTE.length],
      data: result.points.filter((p) => p.y === y).map((p) => ({
        x: result.xLabels.indexOf(p.x) + (Math.random() - 0.5) * 0.55,
        z: p.z,
        xLabel: p.x,
      })),
    }));
  }, [result]);

  // Medianas por categoría de X (línea de referencia visual sobre la dispersión).
  const medianSeries = useMemo(() => {
    if (!result) return [];
    return result.marginalX.map((m) => ({
      x: result.xLabels.indexOf(m.label), z: m.medianZ ?? 0, xLabel: m.label,
    }));
  }, [result]);

  // Barras apiladas: una fila por categoría de X; una serie por categoría de Y (n).
  const stackedData = useMemo(() => {
    if (!result) return [];
    return result.xLabels.map((x) => {
      const row: Record<string, number | string> = { x: short(x, 16) };
      result.yLabels.forEach((y) => { row[y] = cellMap.get(x + "||" + y)?.n ?? 0; });
      return row;
    });
  }, [result, cellMap]);

  function exportCsv() {
    if (!result) return;
    const rows: string[] = [];
    rows.push(["X", "Y", "n", "%", "media_Z", "mediana_Z", "de_Z", "min_Z", "max_Z"].join(";"));
    result.cells.forEach((c) => rows.push([
      c.x, c.y, c.n, f(c.pct, 1), f(c.meanZ), f(c.medianZ), f(c.stdDevZ), f(c.minZ), f(c.maxZ),
    ].join(";")));
    rows.push("");
    rows.push(["Marginal X", "", "n", "%", "media_Z", "mediana_Z"].join(";"));
    result.marginalX.forEach((m) =>
      rows.push([m.label, "", m.n, f(m.pct, 1), f(m.meanZ), f(m.medianZ)].join(";")));
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `multivariable_${id}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Análisis exploratorio multivariable</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Dos variables cualitativas (X, Y) y una cuantitativa (Z) · frecuencia y media de Z por combinación
        </p>
      </div>

      {/* Selección */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Selector label="Variable X (cualitativa)" value={qx} onChange={setQx}
            options={qualitative} disabledId={qy} />
          <Selector label="Variable Y (cualitativa)" value={qy} onChange={setQy}
            options={qualitative} disabledId={qx} />
          <Selector label="Variable Z (numérica)" value={qz} onChange={setQz}
            options={numeric} />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
        )}

        <button onClick={calculate} disabled={!qx || !qy || !qz || qx === qy || loading}
          className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? "Calculando…" : "Analizar"}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="n utilizado" value={String(result.usedN)} />
            <Stat label="Media general de Z" value={f(result.total.meanZ)} />
            <Stat label="Categorías X · Y" value={`${result.xLabels.length} · ${result.yLabels.length}`} />
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center">
              <button onClick={exportCsv}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Exportar CSV
              </button>
            </div>
          </div>

          {Object.keys(result.excluded ?? {}).length > 0 && (
            <p className="text-xs text-gray-500">
              Excluidos:{" "}
              {Object.entries(result.excluded).map(([k, v]) => `${k}: ${v}`).join(" · ")}
            </p>
          )}

          {/* Tabla cruzada: celda = n · media Z */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Tabla cruzada — n · media de Z</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Filas: {short(result.questionTextX, 50)} · Columnas: {short(result.questionTextY, 50)}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 min-w-36">X \ Y</th>
                    {result.yLabels.map((l, i) => (
                      <th key={i} className="text-center px-3 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">
                        {short(l, 18)}
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-700">Marginal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.xLabels.map((x, ri) => {
                    const mx = result.marginalX.find((m) => m.label === x);
                    return (
                      <tr key={ri} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-medium text-gray-700 whitespace-nowrap">{short(x, 28)}</td>
                        {result.yLabels.map((y, ci) => {
                          const c = cellMap.get(x + "||" + y);
                          return (
                            <td key={ci} className="px-2 py-2 text-center">
                              {c ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="text-xs font-bold text-gray-800">{c.n}</span>
                                  <span className="text-xs text-gray-500">{f(c.meanZ)}</span>
                                </div>
                              ) : <span className="text-xs text-gray-300">·</span>}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs font-bold text-gray-900">{mx?.n ?? 0}</span>
                            <span className="text-xs text-gray-500">{f(mx?.meanZ)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td className="px-4 py-3 text-xs font-bold text-gray-700">Marginal Y</td>
                    {result.yLabels.map((y, ci) => {
                      const my = result.marginalY.find((m) => m.label === y);
                      return (
                        <td key={ci} className="px-3 py-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs font-bold text-gray-900">{my?.n ?? 0}</span>
                            <span className="text-xs text-gray-500">{f(my?.meanZ)}</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center text-xs font-bold text-gray-900">{result.usedN}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="px-6 py-3 text-xs text-gray-400 border-t border-gray-100 bg-gray-50">
              Cada celda: <span className="font-semibold text-gray-600">n</span> (arriba) ·{" "}
              <span className="font-semibold text-gray-600">media de Z</span> (abajo).
            </p>
          </div>

          {/* Dispersión categorizada */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">Dispersión categorizada</p>
            <p className="text-xs text-gray-400 mb-4">
              Eje X: categoría de X (con jitter) · Eje Y: Z · color: categoría de Y · ◆ = mediana de Z por X
            </p>
            <ResponsiveContainer width="100%" height={360}>
              <ScatterChart margin={{ top: 8, right: 16, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis
                  type="number" dataKey="x" name="X" domain={[-0.6, result.xLabels.length - 0.4]}
                  ticks={result.xLabels.map((_, i) => i)}
                  tickFormatter={(v: number) => short(result.xLabels[v] ?? "", 12)}
                  tick={{ fontSize: 10, fill: "#6b7280" }} angle={-20} textAnchor="end" height={60}
                  interval={0}
                />
                <YAxis type="number" dataKey="z" name="Z" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <ZAxis range={[40, 40]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(val: any, name: any) => name === "Z" ? [f(Number(val)), "Z"] : [val, name]}
                  labelFormatter={() => ""}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {scatterSeries.map((s) => (
                  <Scatter key={s.name} name={short(s.name, 22)} data={s.data} fill={s.color} fillOpacity={0.7} />
                ))}
                <Scatter name="Mediana por X" data={medianSeries} fill="#111827" shape="diamond" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Barras apiladas */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">Barras apiladas — frecuencia por X y Y</p>
            <p className="text-xs text-gray-400 mb-4">Eje X: categoría de X · segmentos: categoría de Y (n)</p>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={stackedData} margin={{ top: 8, right: 16, bottom: 40, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="x" tick={{ fontSize: 10, fill: "#6b7280" }} angle={-20} textAnchor="end"
                  height={60} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {result.yLabels.map((y, yi) => (
                  <Bar key={y} dataKey={y} stackId="a" name={short(y, 22)}
                    fill={PALETTE[yi % PALETTE.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────────────────────────

function Selector({ label, value, onChange, options, disabledId }: {
  label: string; value: string; onChange: (v: string) => void;
  options: Question[]; disabledId?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 font-medium block mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300">
        <option value="">— Elige una pregunta —</option>
        {options.map((q) => (
          <option key={q.id} value={String(q.id)} disabled={String(q.id) === disabledId}>
            {short(q.text, 70)}
          </option>
        ))}
      </select>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
