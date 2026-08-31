"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import { useToast } from "@/context/ToastContext";
import { Building2, ArrowLeft, Trash2, CheckCircle2, XCircle } from "lucide-react";

function AdminCompaniesContent() {
  const toast = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCompanies();
      if (res.success && res.data) {
        setCompanies(res.data.items || res.data || []);
        setSelectedIds([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === companies.length && companies.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(companies.map((c) => c.id));
    }
  };

  const handleBulkVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    if (selectedIds.length === 0) return;
    if (confirm(`Set verification status of ${selectedIds.length} companies to ${status}?`)) {
      try {
        await Promise.all(selectedIds.map((id) => adminApi.verifyCompany(id, status)));
        toast.success(`Updated status of ${selectedIds.length} companies to ${status}.`);
        setCompanies((prev) =>
          prev.map((c) => (selectedIds.includes(c.id) ? { ...c, verificationStatus: status } : c))
        );
        setSelectedIds([]);
      } catch {
        toast.error("Failed to bulk verify companies.");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected companies?`)) {
      try {
        await adminApi.bulkDeleteCompanies(selectedIds);
        toast.success(`Successfully deleted ${selectedIds.length} companies.`);
        setCompanies((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
        setSelectedIds([]);
      } catch {
        toast.error("Failed to bulk delete companies.");
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const res = await adminApi.deleteCompany(id);
        if (res?.success !== false) {
          toast.success(`Deleted "${name}".`);
          setCompanies((prev) => prev.filter((c) => c.id !== id));
          setSelectedIds((prev) => prev.filter((item) => item !== id));
        } else {
          toast.error("Failed to delete company.");
        }
      } catch {
        toast.error("Error deleting company.");
      }
    }
  };

  const handleVerify = async (id: string, status: 'APPROVED' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED') => {
    let reason: string | undefined = undefined;
    if (status === 'REJECTED') {
      const input = prompt("Reason for rejection (optional):");
      if (input === null) return;
      reason = input.trim() || undefined;
    }
    const res = await adminApi.verifyCompany(id, status, reason);
    if (res?.success !== false) {
      toast.success(`Company status updated to ${status}.`);
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, verificationStatus: status, rejectionReason: reason || c.rejectionReason } : c))
      );
    } else {
      toast.error("Failed to update verification status.");
    }
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80" style={{ color: "var(--color-text-muted)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>Company Verifications &amp; Management</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Moderate enterprise legitimacy, approve verifications, and delete unwanted company profiles</p>
        </div>

        {/* Multi-Select Toolbar */}
        {companies.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--color-text)" }}>
              <input
                type="checkbox"
                checked={selectedIds.length === companies.length && companies.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Select All ({selectedIds.length} / {companies.length} selected)</span>
            </label>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleBulkVerify("VERIFIED")}
                  className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  Approve ({selectedIds.length})
                </button>
                <button
                  onClick={() => handleBulkVerify("REJECTED")}
                  className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition shadow-sm"
                >
                  Reject ({selectedIds.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm"
                >
                  <Trash2 className="h-4 w-4" /> Delete ({selectedIds.length})
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-t-transparent" />
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Building2 className="h-10 w-10 mx-auto mb-3 text-slate-400" />
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>No companies found.</p>
          </div>
        ) : (
          <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <table className="w-full text-left text-xs">
              <thead className="border-b font-semibold uppercase" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }}>
                <tr>
                  <th className="px-4 py-4 w-10">Select</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Location &amp; Site</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <tr key={c.id} className={`border-b transition ${isSelected ? "bg-indigo-50/20 dark:bg-indigo-950/20" : "hover:opacity-80"}`} style={{ borderColor: "var(--color-border)" }}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(c.id)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-sm" style={{ color: "var(--color-text)" }}>
                        {c.name}
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--color-text-muted)" }}>
                        <p>{c.location || "Location not set"}</p>
                        <p className="text-blue-600 dark:text-blue-400">{c.websiteUrl}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 font-bold ${
                          c.verificationStatus === "APPROVED" || c.verificationStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                          c.verificationStatus === "REJECTED" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" :
                          c.verificationStatus === "SUSPENDED" ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" :
                          "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                          {c.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleVerify(c.id, "APPROVED")}
                          className="rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 font-bold hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900 transition text-[11px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerify(c.id, "REJECTED")}
                          className="rounded-lg bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 font-bold hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900 transition text-[11px]"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition inline-flex items-center"
                          title="Delete company"
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

export default function AdminCompaniesPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminCompaniesContent />
    </ProtectedRoute>
  );
}
