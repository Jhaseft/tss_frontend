"use client";

import Link from "next/link";

export default function SurveysPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Encuestas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Archivos cargados y sus análisis
          </p>
        </div>
        <Link
          href="/admin/surveys/upload"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Subir encuesta
        </Link>
      </div>

      <div className="border border-dashed border-gray-300 rounded-xl p-16 text-center">
        <p className="text-gray-400 text-sm">No hay encuestas cargadas aún.</p>
        <Link
          href="/admin/surveys/upload"
          className="mt-2 inline-block text-sm text-gray-600 underline"
        >
          Subir el primer archivo
        </Link>
      </div>
    </div>
  );
}
