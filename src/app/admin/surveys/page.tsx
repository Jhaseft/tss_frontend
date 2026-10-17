"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
          <span className="hidden sm:inline">Copiado</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="hidden sm:inline">Compartir</span>
        </>
      )}
    </button>
  );
}

function ImportResponsesButton({ id, onDone }: { id: number; onDone: (n: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    setLoading(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append("file", files[0]);
      const res = await api.postFile<{ rowsLoaded: number; questionsDetected: number; errors: string[] }>(
        `/api/surveys/${id}/import-responses`,
        form
      );
      setMsg({ text: `${res.rowsLoaded} resp.`, ok: true });
      onDone(res.rowsLoaded);
    } catch {
      setMsg({ text: "Error", ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
      {msg ? (
        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${msg.ok ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
          {msg.text}
        </span>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          title="Importar respuestas CSV"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border border-gray-400 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5m0 0l-4.5-4.5M12 16.5l4.5-4.5" />
            </svg>
          )}
          <span className="hidden sm:inline">Importar CSV</span>
        </button>
      )}
    </>
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
      setErr("Error al borrar.");
      setConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  if (err) {
    return (
      <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1 whitespace-nowrap">
        {err}
      </span>
    );
  }

  if (confirm) {
    return (
      <span className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "…" : "Confirmar"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-2 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
        >
          ✕
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
      <span className="hidden sm:inline">Borrar</span>
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
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Encuestas</h1>
          <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Archivos cargados y sus análisis</p>
        </div>
        <Link
          href="/admin/surveys/upload"
          className="px-3 sm:px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">Subir encuesta</span>
          <span className="sm:hidden">+ Nueva</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : surveys.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">No hay encuestas cargadas aún.</p>
          <Link href="/admin/surveys/upload" className="mt-2 inline-block text-sm text-gray-600 underline">
            Subir el primer archivo
          </Link>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 sm:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 sm:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Origen</th>
                  <th className="text-right px-4 sm:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Respuestas</th>
                  <th className="text-left px-4 sm:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Fecha</th>
                  <th className="px-4 sm:px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {surveys.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-5 py-4 font-medium text-gray-900 max-w-[10rem] sm:max-w-xs truncate" title={s.name}>
                      {s.name}
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-gray-500 hidden md:table-cell whitespace-nowrap">
                      {ORIGIN_LABEL[s.origin] ?? s.origin}
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-right text-gray-700 font-medium hidden sm:table-cell">
                      {s.responseCount}
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-gray-400 whitespace-nowrap hidden lg:table-cell">
                      {new Date(s.createdAt).toLocaleDateString("es-BO", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Link
                          href={`/admin/surveys/${s.id}/dashboard`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors whitespace-nowrap"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <ImportResponsesButton
                          id={s.id}
                          onDone={(n) => setSurveys((prev) =>
                            prev.map((x) => x.id === s.id ? { ...x, responseCount: x.responseCount + n } : x)
                          )}
                        />
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
        </div>
      )}
    </div>
  );
}
