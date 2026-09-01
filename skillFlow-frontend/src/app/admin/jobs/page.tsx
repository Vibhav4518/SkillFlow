"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import { useToast } from "@/context/ToastContext";
import { Briefcase, ArrowLeft, Trash2, Search } from "lucide-react";

function AdminJobsContent() {
  const toast = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getJobs();
      if (res.success && res.data) {
        setJobs(res.data.items || res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((j) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const title = (j.title || "").toLowerCase();
    const employer = (j.company?.name || "").toLowerCase();
    const workType = (j.workType || "").toLowerCase();
    return title.includes(query) || employer.includes(query) || workType.includes(query);
  });

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredJobs.length && filteredJobs.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredJobs.map((j) => j.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStatus = async (id: string, status: string) => {
    const res = await adminApi.updateJobStatus(id, status);
    if (res?.success) {
      toast.success(`Job status updated to ${status}.`);
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status } : j))
      );
    } else {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id: string, title?: string) => {
    if (confirm(`Are you sure you want to delete "${title || 'this job'}"?`)) {
      const res = await adminApi.deleteJob(id);
      if (res?.success !== false) {
        toast.success("Job listing deleted.");
        setJobs((prev) => prev.filter((j) => j.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } else {
        toast.error("Failed to delete job.");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected job listings?`)) {
      try {
        const res = await adminApi.bulkDeleteJobs(selectedIds);
        if (res?.success !== false) {
          toast.success(res?.message || `Deleted ${selectedIds.length} jobs.`);
          setJobs((prev) => prev.filter((j) => !selectedIds.includes(j.id)));
          setSelectedIds([]);
        } else {
          toast.error("Bulk deletion failed.");
        }
      } catch {
        toast.error("Error deleting selected jobs.");
      }
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-bg-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Link href="/admin/dashboard" className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80" style={{ color: "var(--color-text-muted)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>Job Listings Moderation</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Control active postings, compliance, and remove spam listings</p>
        </div>

        {/* Controls Bar: Search + Multi-select Delete */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Job Title, Employer Name, or Work Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border pl-10 pr-4 py-2 text-xs font-medium focus:outline-none"
              style={inputStyle}
            />
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition shadow-sm"
            >
              <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-t-transparent" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Briefcase className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-text-subtle)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {searchQuery ? `No jobs match "${searchQuery}"` : "No job listings found."}
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <table className="w-full text-left text-xs">
              <thead className="border-b font-semibold uppercase" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }}>
                <tr>
                  <th className="px-4 py-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredJobs.length && filteredJobs.length > 0}
                      onChange={handleToggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-4">Title &amp; Employer</th>
                  <th className="px-6 py-4">Work / Job Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((j) => {
                  const isSelected = selectedIds.includes(j.id);
                  return (
                    <tr
                      key={j.id}
                      className={`border-b transition ${isSelected ? "bg-indigo-50/20 dark:bg-indigo-950/20" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30"}`}
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(j.id)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm" style={{ color: "var(--color-text)" }}>{j.title}</p>
                        <p style={{ color: "var(--color-text-muted)" }}>{j.company?.name || "Company"}</p>
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--color-text-muted)" }}>
                        {j.workType} • {j.jobType}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 font-bold ${
                          j.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                          j.status === "UNDER_REVIEW" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                          j.status === "REJECTED" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" :
                          j.status === "CLOSED" ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" :
                          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          {j.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <select
                          value={j.status}
                          onChange={(e) => handleStatus(j.id, e.target.value)}
                          className="rounded-lg border px-2 py-1 text-xs font-semibold"
                          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-input)", color: "var(--color-text)" }}
                        >
                          <option value="PUBLISHED">Published</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="CLOSED">Closed</option>
                          <option value="DRAFT">Draft</option>
                        </select>
                        <button
                          onClick={() => handleDelete(j.id, j.title)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition"
                          style={{ color: "var(--color-text-muted)" }}
                          aria-label="Delete job"
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

export default function AdminJobsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminJobsContent />
    </ProtectedRoute>
  );
}
