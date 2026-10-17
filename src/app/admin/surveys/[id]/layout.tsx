"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Suspense } from "react";

const subNav = [
  { label: "Dashboard",  segment: "dashboard"  },
  { label: "Análisis",   segment: "analisis"   },
  { label: "Simulación", segment: "simulacion" },
  { label: "Exportar",   segment: "exportar"   },
];

function SurveyShell({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-white border-b border-gray-200 px-8 pt-6 pb-0">
        <p className="text-xs text-gray-400 mb-1">Encuesta #{id}</p>
        <nav className="flex gap-1 mt-3">
          {subNav.map((item) => {
            const href = `/admin/surveys/${id}/${item.segment}`;
            const active = pathname.startsWith(href);
            return (
              <Link
                key={item.segment}
                href={href}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  active
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function SurveyLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <SurveyShell>{children}</SurveyShell>
    </Suspense>
  );
}
