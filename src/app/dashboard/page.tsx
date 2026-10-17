"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearAuth } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setLogin(user.email);
  }, [router]);
                    
  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  if (!login) return null;

  return (
    <main className="min-h-screen p-8 bg-zinc-50 dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1">Bienvenido, <span className="font-medium text-zinc-700 dark:text-zinc-300">{login}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900">
          <h2 className="font-medium mb-1">Mi cuenta</h2>
          <p className="text-sm text-zinc-500">Información y configuración de tu cuenta</p>
        </div>
      </div>
    </main>
  );
}
