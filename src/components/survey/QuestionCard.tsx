"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";

type FreqEntry = { label: string; count: number; percentage: number; numericValue?: number };
type MatrixItem = { questionId: number; text: string; mean?: number; distribution: FreqEntry[] };

export type QuestionStats = {
  questionId: number;
  text: string;
  type: string;
  section?: string;
  position: number;
  totalAnswered: number;
  distribution?: FreqEntry[];
  mean?: number;
  stdDev?: number;
  median?: number;
  min?: number;
  max?: number;
  matrixItems?: MatrixItem[];
  sampleResponses?: string[];
};

const CATEGORICAL = new Set(["SINGLE_NOMINAL", "SINGLE_ORDINAL", "MULTIPLE_CHOICE", "LIKERT"]);

function fmt(n: number | undefined, decimals = 1) {
  return n == null ? "—" : n.toFixed(decimals);
}

function CategoricalChart({ data, totalAnswered, mean }: {
  data: FreqEntry[]; totalAnswered: number; mean?: number;
}) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  return (
    <div>
      <div className="space-y-2 mt-3">
        {sorted.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="w-44 shrink-0 text-gray-600 truncate" title={entry.label}>{entry.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="h-2 rounded-full bg-gray-800 transition-all" style={{ width: `${entry.percentage}%` }} />
            </div>
            <span className="w-16 text-right text-gray-700 font-medium shrink-0">
              {entry.count} <span className="text-gray-400 font-normal">({fmt(entry.percentage)}%)</span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-gray-400">
        <span>n = {totalAnswered}</span>
        {mean != null && <span>Media = {fmt(mean, 2)}</span>}
      </div>
    </div>
  );
}

function MatrixCard({ items, totalAnswered }: { items: MatrixItem[]; totalAnswered: number }) {
  const allLabels = items[0]?.distribution?.map((e) => e.label) ?? [];

  const scaleMax = Math.max(
    1,
    ...items.flatMap((i) => (i.distribution ?? []).map((e) => e.numericValue ?? 0)),
  );

  const radarData = items.map((item, idx) => ({
    label: `${idx + 1}`,
    value: item.mean != null ? +(item.mean.toFixed(2)) : 0,
    fullText: item.text,
    hasMean: item.mean != null,
  }));

  const showRadar = radarData.length >= 3 && radarData.some((d) => d.hasMean);

  return (
    <div className="mt-3 space-y-6">

      {/* ── Diagrama radial ── */}
      {showRadar && (
        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Perfil de medias — Diagrama radial
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={270}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#d1d5db" />
                  <PolarAngleAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#374151", fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, scaleMax]}
                    tickCount={scaleMax + 1}
                    tick={{ fontSize: 9, fill: "#9ca3af" }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#111827"
                    fill="#111827"
                    fillOpacity={0.13}
                    strokeWidth={2}
                  />
                  <Tooltip
                    formatter={(v) => [`${Number(v ?? 0).toFixed(2)} / ${scaleMax}`, "Media"]}
                    labelFormatter={(label) => {
                      const item = radarData.find((d) => d.label === label);
                      return item ? item.fullText.slice(0, 80) + (item.fullText.length > 80 ? "…" : "") : String(label);
                    }}
                    contentStyle={{ fontSize: 11, borderRadius: 8, maxWidth: 280 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 pt-2">
              {items.map((item, idx) => (
                <div key={item.questionId} className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-gray-600 leading-snug">{item.text}</p>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-2">Escala: 1 – {scaleMax}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabla de distribución ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 pr-3 font-medium text-gray-500 w-48">Ítem</th>
              {allLabels.map((l, i) => (
                <th key={i} className="text-right py-2 px-2 font-medium text-gray-500 whitespace-nowrap">{l}</th>
              ))}
              <th className="text-right py-2 pl-3 font-medium text-gray-900">Media</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item, idx) => {
              const n = item.distribution?.reduce((s, e) => s + e.count, 0) ?? 0;
              return (
                <tr key={item.questionId} className="hover:bg-gray-50">
                  <td className="py-2 pr-3 text-gray-700 leading-snug">
                    <div className="flex items-start gap-1.5">
                      {showRadar && (
                        <span className="shrink-0 w-4 h-4 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-semibold">
                          {idx + 1}
                        </span>
                      )}
                      <span className="line-clamp-2" title={item.text}>{item.text}</span>
                    </div>
                  </td>
                  {(item.distribution ?? []).map((e, i) => (
                    <td key={i} className="text-right py-2 px-2 text-gray-600">
                      {n > 0 ? fmt(e.percentage) : "—"}%
                    </td>
                  ))}
                  <td className="text-right py-2 pl-3 font-semibold text-gray-900">
                    {fmt(item.mean, 2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-gray-400">n = {totalAnswered}</p>
      </div>
    </div>
  );
}

function NumericCard({ q }: { q: QuestionStats }) {
  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
      {[
        { label: "Media",     value: fmt(q.mean,   2) },
        { label: "Mediana",   value: fmt(q.median, 2) },
        { label: "Desv. Est.", value: fmt(q.stdDev, 2) },
        { label: "Mínimo",    value: fmt(q.min,    2) },
        { label: "Máximo",    value: fmt(q.max,    2) },
      ].map((s) => (
        <div key={s.label} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-400">{s.label}</p>
          <p className="text-base font-semibold text-gray-900 mt-0.5">{s.value}</p>
        </div>
      ))}
      <p className="col-span-full text-xs text-gray-400">n = {q.totalAnswered}</p>
    </div>
  );
}

function TextCard({ samples, n }: { samples: string[]; n: number }) {
  return (
    <div className="mt-3 space-y-1.5">
      {samples.map((s, i) => (
        <p key={i} className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-1.5 truncate" title={s}>{s}</p>
      ))}
      <p className="text-xs text-gray-400 pt-1">
        n = {n} {samples.length < n && `(mostrando ${samples.length})`}
      </p>
    </div>
  );
}

export function QuestionCard({ q }: { q: QuestionStats }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-sm font-medium text-gray-900 leading-snug">{q.text}</p>
        <span className="shrink-0 text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5 whitespace-nowrap">
          {q.type.replace(/_/g, " ")}
        </span>
      </div>

      {CATEGORICAL.has(q.type) && q.distribution && (
        <CategoricalChart data={q.distribution} totalAnswered={q.totalAnswered} mean={q.mean} />
      )}

      {q.type === "MATRIX_LIKERT" && q.matrixItems && (
        <MatrixCard items={q.matrixItems} totalAnswered={q.totalAnswered} />
      )}

      {q.type === "NUMERIC" && <NumericCard q={q} />}

      {["TEXT_SHORT", "TEXT_LONG", "EMAIL", "PHONE", "URL", "DATE"].includes(q.type) && (
        <TextCard samples={q.sampleResponses ?? []} n={q.totalAnswered} />
      )}
    </div>
  );
}
