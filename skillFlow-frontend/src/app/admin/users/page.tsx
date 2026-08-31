"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import { useToast } from "@/context/ToastContext";
import { Users, ArrowLeft, Trash2, Search, ShieldCheck, UserPlus, X, Edit, Lock } from "lucide-react";

function AdminUsersContent() {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  // Add Admin Modal State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ fullName: "", email: "", password: "Admin@12345" });
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  // Edit User Role Modal State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editRole, setEditRole] = useState("ADMIN");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({ search, role });
      if (res.success && res.data) {
        setUsers(res.data.items || res.data.users || []);
        setSelectedIds([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected user accounts?`)) {
      try {
        await Promise.all(selectedIds.map((id) => adminApi.deleteUser(id)));
        setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
        setSelectedIds([]);
        toast.success(`${selectedIds.length} user accounts deleted.`);
      } catch {
        toast.error("Failed to delete selected users.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await adminApi.deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast.success("User deleted successfully.");
      } catch {
        toast.error("Failed to delete user.");
      }
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.fullName.trim() || !adminForm.email.trim()) {
      toast.error("Full Name and Email are required.");
      return;
    }
    try {
      setSubmittingAdmin(true);
      const res = await adminApi.createAdmin(adminForm);
      if (res.success) {
        toast.success(`Admin account for ${adminForm.fullName} created successfully!`);
        setShowAddAdminModal(false);
        setAdminForm({ fullName: "", email: "", password: "Admin@12345" });
        fetchUsers();
      } else {
        toast.error(res.message || "Failed to create Admin.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create Admin.");
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await adminApi.updateUser(editingUser.id, { role: editRole });
      if (res.success) {
        toast.success(`Role updated for ${editingUser.fullName}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, role: editRole } : u))
        );
        setEditingUser(null);
      }
    } catch {
      toast.error("Failed to update user role.");
    }
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin/dashboard" className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80" style={{ color: "var(--color-text-muted)" }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Console
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <Users className="h-7 w-7 text-indigo-500" /> User &amp; Admin Accounts
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Manage candidates, employers, and administrator accounts with full superadmin powers</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddAdminModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-md"
          >
            <UserPlus className="h-4 w-4" /> Create New Admin
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-2xl border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admins Only</option>
            <option value="EMPLOYER">Employers Only</option>
            <option value="CANDIDATE">Candidates Only</option>
          </select>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-red-600/10 border border-red-500/30 px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-600 hover:text-white transition"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-3xl border shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading accounts...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No user accounts found matching your search.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b uppercase text-[10px] tracking-wider text-slate-400" style={{ borderColor: "var(--color-border)" }}>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-slate-700"
                      />
                    </th>
                    <th className="p-4 font-bold">User Name &amp; Email</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold">Registered Date</th>
                    <th className="p-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {users.map((u) => {
                    const isAdmin = u.role === "ADMIN";
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(u.id)}
                            onChange={() => handleToggleSelect(u.id)}
                            className="rounded border-slate-700"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200">{u.fullName}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              isAdmin
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                                : u.role === "EMPLOYER"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {isAdmin && <ShieldCheck className="h-3 w-3" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(u);
                              setEditRole(u.role);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                            title="Edit User Role"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                            title="Delete Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-500" /> Create Administrator
              </h2>
              <button onClick={() => setShowAddAdminModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Admin Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={adminForm.fullName}
                  onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin2@skillflow.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdmin}
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  {submittingAdmin ? "Creating..." : "Create Admin Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white">Edit Role: {editingUser.fullName}</h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditRoleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ADMIN">ADMIN (Full Superadmin Powers)</option>
                  <option value="EMPLOYER">EMPLOYER</option>
                  <option value="CANDIDATE">CANDIDATE</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
