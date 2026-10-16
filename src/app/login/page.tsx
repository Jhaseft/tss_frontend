"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveAuth, isAdmin } from "@/lib/auth";

type AuthResponse = {
  token: string;
  login: string;
  roles: string[];
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post<AuthResponse>("/api/auth/login", { email, password });
      saveAuth(data.token, { login: data.login, roles: data.roles });
      router.push(isAdmin({ login: data.login, roles: data.roles }) ? "/admin" : "/dashboard");
    } catch {
      setError("Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Iniciar sesión</h1>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-transparent text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          required
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-transparent text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          required
          autoComplete="current-password"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
