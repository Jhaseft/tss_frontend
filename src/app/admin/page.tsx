"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearAuth, isAdmin } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");

  useEffect(() => {
    const user = getUser();
    if (!user || !isAdmin(user)) {
      router.replace("/login");
      return;
    }
    setLogin(user.login);
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  if (!login) return null;

  return (
    <main className="min-h-screen p-8 bg-zinc-50 dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Panel de Administrador</h1>
            <p className="text-sm text-zinc-500 mt-1">Bienvenido, <span className="font-medium text-zinc-700 dark:text-zinc-300">{login}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900">
            <h2 className="font-medium mb-1">Usuarios</h2>
            <p className="text-sm text-zinc-500">Gestionar usuarios del sistema</p>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900">
            <h2 className="font-medium mb-1">Roles</h2>
            <p className="text-sm text-zinc-500">Gestionar roles y permisos</p>
          </div>
        </div>
      </div>
    </main>
  );
}
