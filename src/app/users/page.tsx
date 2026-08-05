"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/AdminShell";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  createUser,
  deleteUser,
  listUsers,
  type AdminUser,
} from "@/services/adminAPI";

export default function AdminUsersPage() {
  const { user: me } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsers();
      setUsers(res.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createUser(form);
      toast.success("User created");
      setOpen(false);
      setForm({ name: "", email: "", password: "", role: "admin" });
      await load();
    } catch {
      toast.error("Could not create user");
    }
  };

  const onDelete = async (u: AdminUser) => {
    if (u.id === me?.id) {
      toast.error("Cannot delete yourself");
      return;
    }
    if (!confirm(`Delete ${u.email}?`)) return;
    try {
      await deleteUser(u.id);
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <AdminShell title="User Management">
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#6B7280]">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-left text-xs uppercase tracking-wide text-[#6B7280]">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F3]">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1A2332] text-white text-xs font-semibold flex items-center justify-center">
                        {u.initials}
                      </div>
                      <span className="font-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#5C6370]">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(u)}
                      className="p-2 rounded-lg text-[#DC2626] hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-md bg-white rounded-2xl p-6 space-y-3"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Add User</h3>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Password
              <input
                required
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Role
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm font-normal"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#1A2332] text-white px-4 py-2 text-sm font-semibold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
