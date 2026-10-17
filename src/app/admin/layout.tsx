"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { clearAuth, getUser, isAdmin } from "@/lib/auth";

type NavItem  = { href: string; label: string; match: (p: string) => boolean };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Encuestas",
    items: [
      {
        href: "/admin/surveys",
        label: "Mis encuestas",
        match: (p) => p.startsWith("/admin/surveys") && !p.startsWith("/admin/surveys/upload"),
      },
      {
        href: "/admin/surveys/upload",
        label: "Subir encuesta",
        match: (p) => p.startsWith("/admin/surveys/upload"),
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/users", label: "Usuarios", match: (p) => p.startsWith("/admin/users") },
      { href: "/admin/roles", label: "Roles",    match: (p) => p.startsWith("/admin/roles") },
    ],
  },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  // Cerrar sidebar al cambiar de ruta
  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const user = getUser();
    if (!user || !isAdmin(user)) router.replace("/login");
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Top bar mobile ───────────────────────────────────────────── */}
      <div className="sm:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-gray-900 text-sm">TSS Admin</span>
      </div>

      {/* ── Overlay mobile ───────────────────────────────────────────── */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-56 bg-white border-r border-gray-200 flex flex-col
        transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"}
        sm:translate-x-0
      `}>
        <div className="px-5 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <span className="font-semibold text-gray-900 text-sm">TSS Admin</span>
            <p className="text-xs text-gray-400 mt-0.5">UMSS · Ing. Sistemas</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="sm:hidden p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-left transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ──────────────────────────────────────── */}
      <main className="flex-1 sm:ml-56 pt-14 sm:pt-0 min-w-0">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-gray-50" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
