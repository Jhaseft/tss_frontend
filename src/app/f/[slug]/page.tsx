"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Option = { id: number; displayText: string };
type Question = {
  id: number;
  text: string;
  type: string;
  position: number;
  required: boolean;
  section?: string;
  matrixGroup?: string;
  options?: Option[];
};
type SurveyForm = { surveyId: number; name: string; questions: Question[] };

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const RADIO_TYPES = new Set(["SINGLE_NOMINAL", "SINGLE_ORDINAL", "LIKERT"]);
const TEXT_TYPES: Record<string, string> = {
  TEXT_SHORT: "text", TEXT_LONG: "textarea", EMAIL: "email",
  PHONE: "tel", URL: "url", NUMERIC: "number", DATE: "date",
};

export default function PublicFormPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [form, setForm] = useState<SurveyForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/public/surveys/${slug}`)
      .then((r) => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then((data) => { if (data) setForm(data); })
      .finally(() => setLoading(false));
  }, [slug]);

  function setAnswer(qId: number, val: string | string[]) {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }

  function toggleMulti(qId: number, val: string) {
    const cur = (answers[qId] as string[]) ?? [];
    setAnswers((prev) => ({
      ...prev,
      [qId]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = form!.questions.map((q) => {
        const val = answers[q.id];
        if (Array.isArray(val)) return { questionId: q.id, values: val };
        return { questionId: q.id, value: val ?? "" };
      });
      const r = await fetch(`${API}/api/public/surveys/${slug}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });
      if (!r.ok) throw new Error("Error al enviar");
      setDone(true);
    } catch {
      setError("No se pudo enviar la respuesta. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Agrupar MATRIX_LIKERT por matrixGroup ──────────────────────────────────
  function renderQuestions() {
    if (!form) return null;
    const rendered: React.ReactNode[] = [];
    const seenGroups = new Set<string>();

    for (const q of form.questions) {
      if (q.type === "MATRIX_LIKERT" && q.matrixGroup) {
        if (seenGroups.has(q.matrixGroup)) continue;
        seenGroups.add(q.matrixGroup);
        const groupQs = form.questions.filter(
          (gq) => gq.type === "MATRIX_LIKERT" && gq.matrixGroup === q.matrixGroup
        );
        const opts = groupQs[0]?.options ?? [];
        rendered.push(
          <div key={`matrix-${q.matrixGroup}`} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-900 mb-4">{q.matrixGroup}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 font-normal text-gray-500 w-48">Ítem</th>
                    {opts.map((o) => (
                      <th key={o.id} className="text-center py-2 px-2 font-medium text-gray-600 text-xs whitespace-nowrap">
                        {o.displayText}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {groupQs.map((gq) => (
                    <tr key={gq.id}>
                      <td className="py-3 pr-4 text-gray-700 text-xs">{gq.text}</td>
                      {opts.map((o) => (
                        <td key={o.id} className="py-3 px-2 text-center">
                          <input
                            type="radio"
                            name={`q-${gq.id}`}
                            value={o.displayText}
                            checked={answers[gq.id] === o.displayText}
                            onChange={() => setAnswer(gq.id, o.displayText)}
                            className="accent-gray-800"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      } else if (q.type !== "MATRIX_LIKERT") {
        rendered.push(<QuestionField key={q.id} q={q} answers={answers} setAnswer={setAnswer} toggleMulti={toggleMulti} />);
      }
    }
    return rendered;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Encuesta no encontrada.</p>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-md w-full shadow-sm">
        <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">¡Respuesta enviada!</h2>
        <p className="text-sm text-gray-500">Gracias por completar la encuesta. Tus respuestas fueron registradas correctamente.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl px-8 py-6 mb-6 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Encuesta</p>
          <h1 className="text-xl font-bold text-gray-900">{form?.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Completa todas las preguntas y pulsa Enviar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderQuestions()}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {submitting ? "Enviando…" : "Enviar respuestas"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          UMSS · Facultad de Ciencias y Tecnología · Sistema de seguimiento de titulados
        </p>
      </div>
    </div>
  );
}

// ── Componente por pregunta ────────────────────────────────────────────────────

function QuestionField({
  q, answers, setAnswer, toggleMulti,
}: {
  q: Question;
  answers: Record<number, string | string[]>;
  setAnswer: (id: number, val: string) => void;
  toggleMulti: (id: number, val: string) => void;
}) {
  const val = answers[q.id];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm font-medium text-gray-900 mb-3">
        {q.text}
        {q.required && <span className="text-red-500 ml-1">*</span>}
      </p>

      {RADIO_TYPES.has(q.type) && q.options && (
        <div className="space-y-2">
          {q.options.map((o) => (
            <label key={o.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={`q-${q.id}`}
                value={o.displayText}
                checked={val === o.displayText}
                onChange={() => setAnswer(q.id, o.displayText)}
                className="accent-gray-800 w-4 h-4"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{o.displayText}</span>
            </label>
          ))}
        </div>
      )}

      {q.type === "MULTIPLE_CHOICE" && q.options && (
        <div className="space-y-2">
          {q.options.map((o) => (
            <label key={o.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                value={o.displayText}
                checked={((val as string[]) ?? []).includes(o.displayText)}
                onChange={() => toggleMulti(q.id, o.displayText)}
                className="accent-gray-800 w-4 h-4"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{o.displayText}</span>
            </label>
          ))}
        </div>
      )}

      {q.type === "TEXT_LONG" && (
        <textarea
          rows={3}
          value={(val as string) ?? ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
          placeholder="Escribe tu respuesta..."
        />
      )}

      {q.type in TEXT_TYPES && q.type !== "TEXT_LONG" && (
        <input
          type={TEXT_TYPES[q.type]}
          value={(val as string) ?? ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder={q.type === "EMAIL" ? "correo@ejemplo.com" : q.type === "DATE" ? "" : "Tu respuesta..."}
        />
      )}
    </div>
  );
}
