"use client";

import KpiCard from "@/components/survey/KpiCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Area,
  ReferenceLine,
  Legend,
} from "recharts";

// ── Mock data (se reemplaza con llamadas a /api/surveys/{id}/... ──────────────

const situacionLaboral = [
  { label: "En organización", count: 26, pct: 61.9 },
  { label: "Emprendimiento", count: 9, pct: 21.4 },
  { label: "No trabaja", count: 7, pct: 16.7 },
];

const areasInteres = [
  { label: "IA", count: 12, pct: 44.4, acum: 44.4 },
  { label: "Ing. Software", count: 8, pct: 29.6, acum: 74.1 },
  { label: "Redes / Seg.", count: 4, pct: 14.8, acum: 88.9 },
  { label: "Base de Datos", count: 2, pct: 7.4, acum: 96.3 },
  { label: "Robótica", count: 1, pct: 3.7, acum: 100 },
];

const aspectosUtiles = [
  { label: "Habilidades analíticas", pct: 78.6 },
  { label: "Herramientas industria", pct: 66.7 },
  { label: "Equipos multidiscipl.", pct: 52.4 },
  { label: "Práctica en proyectos", pct: 47.6 },
  { label: "Horarios flexibles", pct: 35.7 },
  { label: "Pasantías", pct: 28.6 },
].sort((a, b) => b.pct - a.pct);

const aspectosMejorar = [
  { label: "Integración teoría-práctica", pct: 71.4 },
  { label: "Relación con empresas", pct: 59.5 },
  { label: "Actualización del plan", pct: 52.4 },
  { label: "Horarios trabajadores", pct: 40.5 },
  { label: "Especialización", pct: 33.3 },
  { label: "Extracurriculares", pct: 21.4 },
].sort((a, b) => b.pct - a.pct);

const likertItems = [
  { item: "Satisfacción global", media: 3.1, sd: 0.7 },
  { item: "Concordancia formación-mercado", media: 2.8, sd: 0.9 },
  { item: "Posgrados afines en FCyT", media: 2.4, sd: 1.0 },
];

const radarData = [
  { subject: "Satisfacción global", value: 3.1, fullMark: 4 },
  { subject: "Concordancia", value: 2.8, fullMark: 4 },
  { subject: "Posgrados FCyT", value: 2.4, fullMark: 4 },
  { subject: "Formación complementaria", value: 3.3, fullMark: 4 },
  { subject: "Empleabilidad percibida", value: 3.0, fullMark: 4 },
];

const timeline = [
  { fecha: "01 Ago", acum: 3 },
  { fecha: "05 Ago", acum: 8 },
  { fecha: "10 Ago", acum: 14 },
  { fecha: "15 Ago", acum: 20 },
  { fecha: "20 Ago", acum: 27 },
  { fecha: "25 Ago", acum: 33 },
  { fecha: "01 Sep", acum: 38 },
  { fecha: "10 Sep", acum: 42 },
];

const COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

// ─────────────────────────────────────────────────────────────────────────────

export default function SurveyDashboardPage() {
  return (
    <div className="flex flex-col gap-8">

      {/* ── Filtros ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
          Filtrar por
        </span>
        {["Situación laboral", "Segmento de madurez", "Género"].map((f) => (
          <select
            key={f}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            defaultValue=""
          >
            <option value="">{f}: Todos</option>
          </select>
        ))}
        <button className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          Limpiar filtros
        </button>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Respuestas" value="42" sub="01 Ago – 10 Sep 2024" highlight />
        <KpiCard label="Ocupados" value="83.3%" sub="35 de 42 titulados" />
        <KpiCard label="Con formación comp." value="71.4%" sub="30 respondieron Sí" />
        <KpiCard label="Interés en posgrado" value="64.3%" sub="27 respondieron Sí" />
        <KpiCard label="Años profesionales" value="4.2" sub="SD ± 2.8" />
        <KpiCard label="Satisfacción media" value="3.1 / 4" sub="Escala acuerdo" />
      </div>

      {/* ── Fila 1: Situación laboral + Timeline ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Situación laboral */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            Situación laboral
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={situacionLaboral} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [`${v}`, "Respuestas"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-col gap-1">
            {situacionLaboral.map((d) => (
              <div key={d.label} className="flex justify-between text-xs text-gray-500">
                <span>{d.label}</span>
                <span className="font-medium text-gray-700">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Línea temporal acumulada */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            Recolección acumulada de respuestas
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeline} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [v, "Respuestas acumuladas"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Line
                type="monotone"
                dataKey="acum"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={{ fill: "#1d4ed8", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Fila 2: Aspectos útiles (horizontal) ───────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-900 mb-4">
          Aspectos de mayor utilidad{" "}
          <span className="text-xs font-normal text-gray-400">
            (% de respondentes que los marcaron)
          </span>
        </p>
        <div className="flex flex-col gap-2.5">
          {aspectosUtiles.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-44 shrink-0 text-right">
                {d.label}
              </span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fila 3: Aspectos a mejorar ─────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-900 mb-4">
          Aspectos a mejorar{" "}
          <span className="text-xs font-normal text-gray-400">
            (% de respondentes que los marcaron)
          </span>
        </p>
        <div className="flex flex-col gap-2.5">
          {aspectosMejorar.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-44 shrink-0 text-right">
                {d.label}
              </span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fila 4: Pareto áreas + Radar Likert ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pareto áreas de interés */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Áreas de interés en posgrado
          </p>
          <p className="text-xs text-gray-400 mb-4">
            IA + Ing. Software concentran el{" "}
            <span className="font-semibold text-blue-600">74.1%</span> de las
            preferencias
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={areasInteres} margin={{ left: -10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 15]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Bar yAxisId="left" dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} name="Respuestas" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="acum"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 3 }}
                name="% acumulado"
              />
              <ReferenceLine
                yAxisId="right"
                y={70}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "70%", position: "right", fontSize: 10, fill: "#ef4444" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Likert */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Valoración media (escala 1–4)
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Ítems Likert de acuerdo · n = 42
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 10, fill: "#6b7280" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 4]}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickCount={3}
              />
              <Radar
                name="Media"
                dataKey="value"
                stroke="#1d4ed8"
                fill="#1d4ed8"
                fillOpacity={0.2}
                dot={{ fill: "#1d4ed8", r: 3 }}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Tabla resumen debajo del radar */}
          <div className="mt-2 border-t border-gray-100 pt-3 flex flex-col gap-1.5">
            {likertItems.map((d) => (
              <div key={d.item} className="flex justify-between text-xs text-gray-600">
                <span className="truncate max-w-50">{d.item}</span>
                <span className="font-semibold text-gray-900 ml-2">
                  {d.media.toFixed(1)}{" "}
                  <span className="font-normal text-gray-400">± {d.sd}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Nota metodológica ───────────────────────────────────── */}
      <p className="text-xs text-gray-400 text-center pb-2">
        Muestreo por conveniencia · Resultados descriptivos y exploratorios ·
        No generalizables a la población
      </p>
    </div>
  );
}
