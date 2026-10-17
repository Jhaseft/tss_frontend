"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const subNav = [
  { label: "Dashboard", segment: "dashboard" },
  { label: "Análisis", segment: "analysis" },
  { label: "Simulación", segment: "simulation" },
  { label: "Exportar", segment: "export" },
];

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-white border-b border-gray-200 px-8 pt-6 pb-0">
        <p className="text-xs text-gray-400 mb-1">Encuesta</p>
        <h1 className="text-lg font-semibold text-gray-900 mb-4">
          {id}
        </h1>
        <nav className="flex gap-1">
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

      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
