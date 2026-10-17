"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Authority = { name: string };

export default function RolesPage() {
  const [roles, setRoles] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    setLoading(true);
    const data = await api.get<Authority[]>("/api/authorities");
    setRoles(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const name = newName.toUpperCase().startsWith("ROLE_") ? newName.toUpperCase() : `ROLE_${newName.toUpperCase()}`;
      await api.post("/api/authorities", { name });
      setShowCreate(false);
      setNewName("");
      await fetchRoles();
    } catch {
      setError("Error al crear rol");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await api.delete(`/api/authorities/${encodeURIComponent(deleteTarget)}`);
      setDeleteTarget(null);
      await fetchRoles();
    } catch {
      setError("No se puede eliminar un rol con usuarios asignados");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Roles</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Nuevo rol
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.name} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">{r.name}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteTarget(r.name)} className="text-red-400 hover:text-red-600 text-xs font-medium">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Nuevo rol</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Nombre del rol</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gray-900">
                  <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">ROLE_</span>
                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    placeholder="MANAGER"
                  />
                </div>
                <p className="text-xs text-gray-400">Se guardará como ROLE_{newName.toUpperCase() || "NOMBRE"}</p>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
                  {saving ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm eliminar */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Eliminar rol</h2>
            <p className="text-sm text-gray-600 mb-4">¿Seguro que quieres eliminar <strong>{deleteTarget}</strong>?</p>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => { setDeleteTarget(null); setError(""); }} className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDelete} disabled={saving} className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {saving ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
