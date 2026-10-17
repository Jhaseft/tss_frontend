"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Survey = {
  id: number;
  name: string;
  origin: string;
  publicSlug: string;
  createdAt: string;
  responseCount: number;
};

const ORIGIN_LABEL: Record<string, string> = {
  MS_FORMS: "Microsoft Forms",
  GOOGLE_FORMS: "Google Forms",
  GENERIC: "Genérico",
};

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Survey[]>("/api/surveys")
      .then(setSurveys)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Encuestas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Archivos cargados y sus análisis</p>
        </div>
        <Link
          href="/admin/surveys/upload"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Subir encuesta
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : surveys.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl p-16 text-center">
          <p className="text-gray-400 text-sm">No hay encuestas cargadas aún.</p>
          <Link href="/admin/surveys/upload" className="mt-2 inline-block text-sm text-gray-600 underline">
            Subir el primer archivo
          </Link>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Origen</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Respuestas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {surveys.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{s.name}</td>
                  <td className="px-5 py-4 text-gray-500">{ORIGIN_LABEL[s.origin] ?? s.origin}</td>
                  <td className="px-5 py-4 text-right text-gray-700 font-medium">{s.responseCount}</td>
                  <td className="px-5 py-4 text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/surveys/${s.id}/dashboard`}
                      className="text-xs text-gray-600 hover:text-gray-900 font-medium underline underline-offset-2"
                    >
                      Ver dashboard
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
