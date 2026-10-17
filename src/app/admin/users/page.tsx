"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Authority = { name: string };
type User = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  activated: boolean;
  authorities: Authority[];
};

const EMPTY_FORM = { email: "", firstName: "", lastName: "", password: "", roles: [] as string[] };
const EMPTY_EDIT = { email: "", firstName: "", lastName: "", activated: true, password: "", roles: [] as string[] };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [u, r] = await Promise.all([api.get<User[]>("/api/users"), api.get<Authority[]>("/api/authorities")]);
    setUsers(u);
    setRoles(r);
    setLoading(false);
  }

  function openEdit(user: User) {
    setEditTarget(user);
    setEditForm({
      email: user.email ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      activated: user.activated,
      password: "",
      roles: user.authorities.map((a) => a.name),
    });
  }

  function toggleRole(form: typeof EMPTY_FORM | typeof EMPTY_EDIT, role: string, setForm: (f: any) => void) {
    const roles = (form as any).roles as string[];
    setForm({ ...form, roles: roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role] });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/api/users", createForm);
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      await fetchAll();
    } catch {
      setError("Error al crear usuario");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setError("");
    try {
      await api.put(`/api/users/${editTarget.id}`, editForm);
      setEditTarget(null);
      await fetchAll();
    } catch {
      setError("Error al actualizar usuario");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await api.delete(`/api/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchAll();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Usuarios</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Nuevo usuario
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
                <th className="text-left px-4 py-3 font-medium text-gray-500">Correo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Roles</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.authorities.map((a) => (
                        <span key={a.name} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {a.name.replace("ROLE_", "")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.activated ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {u.activated ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-gray-700 text-xs font-medium">Editar</button>
                      <button onClick={() => setDeleteTarget(u)} className="text-red-400 hover:text-red-600 text-xs font-medium">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear */}
      {showCreate && (
        <Modal title="Nuevo usuario" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre"><input value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} /></Field>
              <Field label="Apellido"><input value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} /></Field>
            </div>
            <Field label="Correo"><input required type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} /></Field>
            <Field label="Contraseña"><input required type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} /></Field>
            <Field label="Roles">
              <div className="flex gap-2 flex-wrap mt-1">
                {roles.map((r) => (
                  <RoleChip key={r.name} name={r.name} active={createForm.roles.includes(r.name)} onClick={() => toggleRole(createForm, r.name, setCreateForm)} />
                ))}
              </div>
            </Field>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <ModalActions onCancel={() => setShowCreate(false)} saving={saving} label="Crear" />
          </form>
        </Modal>
      )}

      {/* Modal editar */}
      {editTarget && (
        <Modal title={`Editar — ${editTarget.email}`} onClose={() => setEditTarget(null)}>
          <form onSubmit={handleEdit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre"><input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} /></Field>
              <Field label="Apellido"><input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} /></Field>
            </div>
            <Field label="Correo"><input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></Field>
            <Field label="Nueva contraseña (opcional)"><input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} /></Field>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="activated" checked={editForm.activated} onChange={(e) => setEditForm({ ...editForm, activated: e.target.checked })} className="rounded" />
              <label htmlFor="activated" className="text-sm text-gray-600">Activo</label>
            </div>
            <Field label="Roles">
              <div className="flex gap-2 flex-wrap mt-1">
                {roles.map((r) => (
                  <RoleChip key={r.name} name={r.name} active={editForm.roles.includes(r.name)} onClick={() => toggleRole(editForm, r.name, setEditForm)} />
                ))}
              </div>
            </Field>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <ModalActions onCancel={() => setEditTarget(null)} saving={saving} label="Guardar" />
          </form>
        </Modal>
      )}

      {/* Confirm eliminar */}
      {deleteTarget && (
        <Modal title="Eliminar usuario" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600 mb-4">
            ¿Seguro que quieres eliminar a <strong>{deleteTarget.email}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)} className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleDelete} disabled={saving} className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {saving ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <div className="[&_input]:w-full [&_input]:border [&_input]:border-gray-200 [&_input]:rounded-lg [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-gray-900">
        {children}
      </div>
    </div>
  );
}

function RoleChip({ name, active, onClick }: { name: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-xs px-3 py-1 rounded-full border transition-colors ${active ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
      {name.replace("ROLE_", "")}
    </button>
  );
}

function ModalActions({ onCancel, saving, label }: { onCancel: () => void; saving: boolean; label: string }) {
  return (
    <div className="flex justify-end gap-3 mt-2">
      <button type="button" onClick={onCancel} className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
      <button type="submit" disabled={saving} className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
        {saving ? "Guardando..." : label}
      </button>
    </div>
  );
}
