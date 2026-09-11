"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import AdminSkeleton from "@/components/AdminSkeleton";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  createUser,
  deleteUser,
  listUsers,
  type AdminUser,
} from "@/services/adminAPI";

export default function AdminUsersPage() {
  const { user: me } = useAdminAuth();
  const canManageUsers = me?.role === "admin";
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor",
  });

  const load = useCallback(async () => {
    if (!canManageUsers) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await listUsers();
      setUsers(res.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [canManageUsers]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createUser(form);
      toast.success("User created");
      setOpen(false);
      setForm({ name: "", email: "", password: "", role: "editor" });
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

  if (!canManageUsers) {
    return (
      <p className="text-sm text-[#5C6370]">
        Only admins can create or revoke individual user credentials.
      </p>
    );
  }

  return (
    <>
<<<<<<< Updated upstream
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <p className="rounded-xl border border-[#E8EAED] bg-[#F8FAFC] px-4 py-3 text-sm text-[#334155]">
          Create one login per person (individually revocable). Keep these accounts on the
          staging database until Vedant signs off production access. Do not share a single
          token.
=======
    {(!loading || users.length > 0) && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <p className="text-sm text-[#5C6370]">
          Each content partner needs their own email and password. Do not share one login.
>>>>>>> Stashed changes
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>
    )}

      {loading ? (
        <AdminSkeleton variant="rows" count={4} />
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-[#E8EAED]">
          <table className="w-full min-w-[640px] text-sm">
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
        <div className="tk-overlay">
          <form
            onSubmit={onSubmit}
            className="tk-sheet w-full max-w-md bg-white p-4 sm:p-6 space-y-3"
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
    </>
  );
}
