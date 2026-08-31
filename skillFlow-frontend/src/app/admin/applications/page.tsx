"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, Users, Search, Trash2, FileText } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SELECTED: "Selected (Hired)",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const STATUS_BADGE: Record<string, string> = {
  SELECTED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  INTERVIEW: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  SHORTLISTED: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  WITHDRAWN: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

function AdminApplicationsContent() {
  const toast = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getApplications({ limit: 100 });
      if (res?.success && res?.data) {
        setApplications(Array.isArray(res.data) ? res.data : res.data.items || res.data.applications || []);
        setSelectedIds([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== "ALL" && app.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const candidateName = (app.candidate?.user?.fullName || app.candidateId || "").toLowerCase();
        const jobTitle = (app.job?.title || app.jobId || "").toLowerCase();
        const companyName = (app.job?.company?.name || "").toLowerCase();
        return candidateName.includes(query) || jobTitle.includes(query) || companyName.includes(query);
      }
      return true;
    });
  }, [applications, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: applications.length };
    Object.keys(STATUS_LABELS).forEach((st) => { counts[st] = 0; });
    applications.forEach((a) => {
      if (a.status) counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  }, [applications]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredApps.length && filteredApps.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApps.map((a) => a.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (appId: string, status: string) => {
    const res = await adminApi.updateApplicationStatus(appId, status);
    if (res?.success !== false) {
      toast.success(`Application status changed to ${STATUS_LABELS[status] || status}.`);
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
    } else {
      toast.error(res?.message || "Failed to update application status.");
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.length === 0) return;
    if (confirm(`Update status of ${selectedIds.length} applications to ${STATUS_LABELS[status] || status}?`)) {
      try {
        await Promise.all(selectedIds.map((id) => adminApi.updateApplicationStatus(id, status)));
        toast.success(`Updated ${selectedIds.length} application statuses.`);
        setApplications((prev) =>
          prev.map((a) => (selectedIds.includes(a.id) ? { ...a, status } : a))
        );
        setSelectedIds([]);
      } catch {
        toast.error("Failed to perform bulk status update.");
      }
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      try {
        const res = await adminApi.bulkDeleteApplications([appId]);
        if (res?.success !== false) {
          toast.success("Deleted application.");
          setApplications((prev) => prev.filter((a) => a.id !== appId));
          setSelectedIds((prev) => prev.filter((id) => id !== appId));
        } else {
          toast.error("Failed to delete application.");
        }
      } catch {
        toast.error("Error deleting application.");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected applications?`)) {
      try {
        const res = await adminApi.bulkDeleteApplications(selectedIds);
        if (res?.success !== false) {
          toast.success(res?.message || `Deleted ${selectedIds.length} applications.`);
          setApplications((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
          setSelectedIds([]);
        } else {
          toast.error("Bulk deletion failed.");
        }
      } catch {
        toast.error("Error deleting selected applications.");
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
          <Link
            href="/admin/dashboard"
            className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80"
            style={{ color: "var(--color-text-muted)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>
            Admin Application Pipeline
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Platform-wide application moderation, candidate pipelines, resume views, and stage management
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-4 overflow-x-auto" style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              statusFilter === "ALL" ? "bg-indigo-600 text-white shadow-sm" : "border hover:opacity-80"
            }`}
            style={statusFilter !== "ALL" ? { borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text-muted)" } : {}}
          >
            <span>All Applications</span>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-extrabold">{statusCounts.ALL || 0}</span>
          </button>

          {Object.entries(STATUS_LABELS).map(([key, label]) => {
            const isActive = statusFilter === key;
            const count = statusCounts[key] || 0;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  isActive ? "bg-indigo-600 text-white shadow-sm" : "border hover:opacity-80"
                }`}
                style={!isActive ? { borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text-muted)" } : {}}
              >
                <span>{label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${isActive ? "bg-black/20 text-white" : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controls Bar: Search + Multi-select Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Candidate Name, Job Position, or Company Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none"
              style={inputStyle}
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <select
                onChange={(e) => e.target.value && handleBulkStatusChange(e.target.value)}
                defaultValue=""
                className="rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none"
                style={inputStyle}
              >
                <option value="" disabled>Bulk Status Update...</option>
                {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>

              <button
                onClick={handleBulkDelete}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition shadow-sm"
              >
                <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.length})
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div
            className="rounded-3xl border p-12 text-center"
            style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
          >
            <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>
              {searchQuery || statusFilter !== "ALL" ? "No applications match your search or filter" : "No applications found"}
            </h3>
          </div>
        ) : (
          <div
            className="rounded-3xl border overflow-hidden shadow-sm"
            style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }}
                  >
                    <th className="px-4 py-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredApps.length && filteredApps.length > 0}
                        onChange={handleToggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-3.5 font-bold uppercase">Candidate</th>
                    <th className="px-6 py-3.5 font-bold uppercase">Job Position</th>
                    <th className="px-6 py-3.5 font-bold uppercase">Company</th>
                    <th className="px-6 py-3.5 font-bold uppercase">Resume</th>
                    <th className="px-6 py-3.5 font-bold uppercase">Status</th>
                    <th className="px-6 py-3.5 font-bold uppercase">Applied Date</th>
                    <th className="px-6 py-3.5 font-bold uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {filteredApps.map((app) => {
                    const isSelected = selectedIds.includes(app.id);
                    const resume = app.resumeUrl || app.resume || app.candidate?.resumeUrl;

                    return (
                      <tr
                        key={app.id}
                        className={`transition ${isSelected ? "bg-indigo-50/20 dark:bg-indigo-950/20" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30"}`}
                      >
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(app.id)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 font-bold" style={{ color: "var(--color-text)" }}>
                          {app.candidate?.user?.fullName || app.candidateId || "Candidate"}
                        </td>
                        <td className="px-6 py-4 font-semibold" style={{ color: "var(--color-text)" }}>
                          {app.job?.title || app.jobId || "Job"}
                        </td>
                        <td className="px-6 py-4" style={{ color: "var(--color-text-muted)" }}>
                          {app.job?.company?.name || "Company"}
                        </td>
                        <td className="px-6 py-4">
                          {resume ? (
                            <a
                              href={resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] hover:bg-indigo-100 transition"
                            >
                              <FileText className="h-3 w-3" /> View Resume
                            </a>
                          ) : (
                            <span className="text-gray-400 text-[11px]">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${STATUS_BADGE[app.status] || STATUS_BADGE.APPLIED}`}>
                            {STATUS_LABELS[app.status] || app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(app.appliedAt || app.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className="rounded-lg border px-2 py-1 text-[11px] font-semibold focus:outline-none"
                              style={inputStyle}
                            >
                              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleDeleteApp(app.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                              title="Delete application"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminApplicationsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminApplicationsContent />
    </ProtectedRoute>
  );
}
