"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/api";

type ImportResult = {
  surveyId: number;
  publicSlug: string;
  surveyName: string;
  origin: string;
  rowsLoaded: number;
  questionsDetected: number;
  errors: string[];
};

const ORIGIN_LABEL: Record<string, string> = {
  MS_FORMS: "Microsoft Forms",
  GOOGLE_FORMS: "Google Forms",
  GENERIC: "Genérico",
};

export default function UploadSurveyPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      setError("Solo se aceptan archivos .xlsx, .xls o .csv");
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const data = await api.postFile<ImportResult>("/api/surveys/upload", form);
      if (data.errors?.length && !data.surveyId) {
        setError(data.errors[0]);
      } else {
        setResult(data);
      }
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Subir encuesta</h1>
      <p className="text-sm text-gray-500 mb-8">
        Carga un Excel o CSV exportado de Microsoft Forms o Google Forms. El
        sistema detectará automáticamente la estructura y registrará todas las
        respuestas.
      </p>

      {/* Zona de carga */}
      {!result && (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-xl p-14 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-blue-400 bg-blue-50"
                : file
                ? "border-gray-400 bg-gray-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB · Haz clic para cambiar
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">
                  Arrastra tu archivo o{" "}
                  <span className="text-gray-900 font-medium underline">selecciónalo</span>
                </p>
                <p className="text-xs text-gray-400">.xlsx · .xls · .csv</p>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="mt-5 w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg
                       hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : "Importar encuesta"}
          </button>
        </>
      )}

      {/* Resultado */}
      {result && (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Encuesta importada correctamente</p>
              <p className="text-gray-400 text-xs mt-0.5">{result.surveyName}</p>
            </div>
          </div>

          <div className="px-6 py-5 grid grid-cols-3 gap-4 border-b border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{result.rowsLoaded}</p>
              <p className="text-xs text-gray-500 mt-0.5">Respuestas cargadas</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-2xl font-bold text-gray-900">{result.questionsDetected}</p>
              <p className="text-xs text-gray-500 mt-0.5">Preguntas detectadas</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {ORIGIN_LABEL[result.origin] ?? result.origin}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Origen detectado</p>
            </div>
          </div>

          {result.errors?.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-amber-700 mb-2">Advertencias</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-amber-600">• {e}</p>
              ))}
            </div>
          )}

          <div className="px-6 py-4 flex gap-3">
            <button
              onClick={() => router.push(`/admin/surveys/${result.surveyId}/dashboard`)}
              className="flex-1 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ver dashboard
            </button>
            <button
              onClick={() => { setResult(null); setFile(null); }}
              className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Subir otro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
