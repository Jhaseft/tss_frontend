"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function DownloadCard({
  icon, title, description, filename, url, token,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  filename: string;
  url: string;
  token: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) throw new Error(`Error ${r.status}`);
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      setError("No se pudo descargar el archivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      </div>
      <button
        onClick={download}
        disabled={loading}
        className="mt-4 w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40"
      >
        {loading ? "Descargando…" : "Descargar"}
      </button>
    </div>
  );
}

export default function ExportarPage() {
  const params = useParams();
  const id = params?.id as string;

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Exportar</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Descarga los datos de la encuesta en distintos formatos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DownloadCard
          icon={
            <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="Excel completo"
          description="Tres hojas: datos brutos, distribución de frecuencias y análisis Likert con medias y desviaciones."
          filename={`encuesta_${id}.xlsx`}
          url={`${API}/api/surveys/${id}/export/excel`}
          token={token}
        />

        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <p className="text-xs text-gray-400 font-medium">PDF de gráficas</p>
          <p className="text-xs text-gray-400">Próximamente</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-gray-700 mb-2">Contenido del Excel</p>
        <div className="space-y-1.5 text-xs text-gray-500">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 bg-gray-200 rounded text-center font-semibold text-gray-700 shrink-0 leading-5">1</span>
            <span><strong className="text-gray-700">Datos brutos</strong> — una fila por respuesta con todas las preguntas como columnas</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 bg-gray-200 rounded text-center font-semibold text-gray-700 shrink-0 leading-5">2</span>
            <span><strong className="text-gray-700">Frecuencias</strong> — tabla de distribución por cada pregunta categórica</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 bg-gray-200 rounded text-center font-semibold text-gray-700 shrink-0 leading-5">3</span>
            <span><strong className="text-gray-700">Análisis Likert</strong> — media, desviación, mínimo y máximo por ítem</span>
          </div>
        </div>
      </div>
    </div>
  );
}
