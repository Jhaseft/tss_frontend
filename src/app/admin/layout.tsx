"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { clearAuth, getUser, isAdmin } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  match: (p: string) => boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Encuestas",
    items: [
      {
        href: "/admin/surveys",
        label: "Mis encuestas",
        match: (p) =>
          p.startsWith("/admin/surveys") &&
          !p.startsWith("/admin/surveys/upload"),
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
      {
        href: "/admin/users",
        label: "Usuarios",
        match: (p) => p.startsWith("/admin/users"),
      },
      {
        href: "/admin/roles",
        label: "Roles",
        match: (p) => p.startsWith("/admin/roles"),
      },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

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
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gray-200">
          <span className="font-semibold text-gray-900 text-sm">TSS Admin</span>
          <p className="text-xs text-gray-400 mt-0.5">UMSS · Ing. Sistemas</p>
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

      <main className="flex-1 ml-56">{children}</main>
    </div>
  );
}
