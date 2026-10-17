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


function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  function copy() {
    const link = `${window.location.origin}/f/${slug}`;
    setUrl(link);
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      title={url || `/f/${slug}`}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
        copied
          ? "bg-green-50 border-green-300 text-green-700"
          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copiado
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Compartir
        </>
      )}
    </button>
  );
}

function DeleteButton({ id, onDeleted }: { id: number; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setErr(null);
    try {
      await api.delete(`/api/surveys/${id}`);
      onDeleted();
    } catch {
      setErr("No se pudo borrar. Intenta de nuevo.");
      setConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  if (err) {
    return (
      <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
        {err}
      </span>
    );
  }

  if (confirm) {
    return (
      <span className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? "…" : "Confirmar"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Borrar
    </button>
  );
}

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
                  <td className="px-5 py-4 font-medium text-gray-900 max-w-xs truncate" title={s.name}>
                    {s.name}
                  </td>
                  <td className="px-5 py-4 text-gray-500">{ORIGIN_LABEL[s.origin] ?? s.origin}</td>
                  <td className="px-5 py-4 text-right text-gray-700 font-medium">{s.responseCount}</td>
                  <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleDateString("es-BO", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/surveys/${s.id}/dashboard`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dashboard
                      </Link>
                      <ShareButton slug={s.publicSlug} />
                      <DeleteButton
                        id={s.id}
                        onDeleted={() => setSurveys((prev) => prev.filter((x) => x.id !== s.id))}
                      />
                    </div>
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
