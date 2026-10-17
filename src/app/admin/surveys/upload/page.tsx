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

const EXAMPLE_JSON = {
  name: "Encuesta de ejemplo",
  origin: "GENERIC",
  likertScales: [
    {
      name: "Acuerdo 4",
      options: [
        { displayText: "Totalmente de acuerdo", numericValue: 4, position: 0 },
        { displayText: "Parcialmente de acuerdo", numericValue: 3, position: 1 },
        { displayText: "Totalmente desacuerdo", numericValue: 1, position: 2 },
        { displayText: "No sabe", numericValue: null, position: 3 }
      ]
    }
  ],
  questions: [
    {
      position: 0,
      columnName: "email",
      text: "Correo electrónico",
      type: "EMAIL",
      personalData: true
    },
    {
      position: 1,
      columnName: "nombre",
      text: "Nombre completo",
      type: "TEXT_SHORT",
      personalData: true
    },
    {
      position: 2,
      columnName: "sector",
      text: "¿A qué sector pertenece?",
      type: "SINGLE_NOMINAL",
      section: "Datos generales",
      options: [
        { displayText: "Público", numericValue: null, position: 0 },
        { displayText: "Privado", numericValue: null, position: 1 },
        { displayText: "ONG", numericValue: null, position: 2 }
      ]
    },
    {
      position: 3,
      columnName: "satisfaccion_trabajo",
      text: "Estoy satisfecho con mi trabajo actual",
      type: "MATRIX_LIKERT",
      section: "Satisfacción laboral",
      matrixGroup: "Indique su nivel de acuerdo:",
      likertScaleName: "Acuerdo 4"
    },
    {
      position: 4,
      columnName: "satisfaccion_salario",
      text: "Mi salario es adecuado para mis responsabilidades",
      type: "MATRIX_LIKERT",
      section: "Satisfacción laboral",
      matrixGroup: "Indique su nivel de acuerdo:",
      likertScaleName: "Acuerdo 4"
    },
    {
      position: 5,
      columnName: "comentarios",
      text: "Comentarios adicionales",
      type: "TEXT_LONG",
      section: "Comentarios"
    }
  ]
};

function downloadExample() {
  const blob = new Blob([JSON.stringify(EXAMPLE_JSON, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "encuesta_ejemplo.json";
  a.click();
  URL.revokeObjectURL(url);
}

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
    if (!f.name.endsWith(".json")) {
      setError("Solo se aceptan archivos .json");
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
      const text = await file.text();
      const def = JSON.parse(text);
      const data = await api.post<ImportResult>("/api/surveys/from-definition", def);
      if (data.errors?.length && !data.surveyId) {
        setError(data.errors[0]);
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e instanceof SyntaxError ? "El JSON no es válido." : "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Nueva encuesta</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Crea la estructura desde una definición JSON, luego carga las respuestas desde la lista.
          </p>
        </div>
        <button
          onClick={downloadExample}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5m0 0l-4.5-4.5M12 16.5l4.5-4.5" />
          </svg>
          Descargar ejemplo
        </button>
      </div>

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
              accept=".json"
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
                <p className="text-xs text-gray-400">.json</p>
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
            {loading ? "Creando…" : "Crear encuesta"}
          </button>
        </>
      )}

      {result && (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Encuesta creada correctamente</p>
              <p className="text-gray-400 text-xs mt-0.5">{result.surveyName}</p>
            </div>
          </div>

          <div className="px-6 py-5 grid grid-cols-2 gap-4 border-b border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{result.questionsDetected}</p>
              <p className="text-xs text-gray-500 mt-0.5">Preguntas creadas</p>
            </div>
            <div className="text-center border-l border-gray-100">
              <p className="text-sm font-semibold text-gray-900 mt-1">
                Carga el CSV desde la lista de encuestas
              </p>
              <p className="text-xs text-gray-500 mt-0.5">con el botón "Importar CSV"</p>
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
              onClick={() => router.push("/admin/surveys")}
              className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ir a encuestas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
