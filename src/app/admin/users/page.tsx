"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import { Users, ArrowLeft, Trash2, Search, ShieldCheck } from "lucide-react";

function AdminUsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

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
      } catch {
        // Handle error
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard" className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80" style={{ color: "var(--color-text-muted)" }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Console
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>User Accounts</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Manage registered candidates, employers, and administrative accounts</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}>
            <Search className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
              className="w-full bg-transparent text-sm focus:outline-none"
              style={{ color: "var(--color-text)" }}
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border px-4 py-2 text-sm font-semibold"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text)" }}
          >
            <option value="">All Roles</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="EMPLOYER">Employer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Multi-Select Toolbar */}
        {users.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--color-text)" }}>
              <input
                type="checkbox"
                checked={selectedIds.length === users.length && users.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Select All ({selectedIds.length} / {users.length} selected)</span>
            </label>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm"
              >
                <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Users className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-text-subtle)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>No users found.</p>
          </div>
        ) : (
          <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <table className="w-full text-left text-xs">
              <thead className="border-b font-semibold uppercase" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }}>
                <tr>
                  <th className="px-4 py-4 w-10">Select</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelected = selectedIds.includes(u.id);
                  return (
                    <tr key={u.id} className={`border-b transition ${isSelected ? "bg-indigo-50/20 dark:bg-indigo-950/20" : "hover:opacity-80"}`} style={{ borderColor: "var(--color-border)" }}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(u.id)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <p className="font-bold text-sm" style={{ color: "var(--color-text)" }}>{u.fullName}</p>
                        <p style={{ color: "var(--color-text-muted)" }}>{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 font-bold ${
                          u.role === "ADMIN" ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" :
                          u.role === "EMPLOYER" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400" :
                          "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--color-text-muted)" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition"
                          style={{ color: "var(--color-text-muted)" }}
                          aria-label="Delete user"
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
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
