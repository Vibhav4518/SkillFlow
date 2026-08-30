"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, Users, Search, Trash2 } from "lucide-react";

function AdminApplicationsContent() {
  const toast = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getApplications({ limit: 50 });
      if (res?.success && res?.data) {
        setApplications(Array.isArray(res.data) ? res.data : res.data.items || res.data.applications || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const filteredApps = applications.filter((app) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const candidateName = (app.candidate?.user?.fullName || app.candidateId || "").toLowerCase();
    const jobTitle = (app.job?.title || app.jobId || "").toLowerCase();
    const companyName = (app.job?.company?.name || "").toLowerCase();
    return candidateName.includes(query) || jobTitle.includes(query) || companyName.includes(query);
  });

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
    if (res?.success) {
      toast.success(`Application status changed to ${status}.`);
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
    } else {
      toast.error(res?.message || "Failed to update application status.");
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.length === 0) return;
    if (confirm(`Update status of ${selectedIds.length} applications to ${status}?`)) {
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
            Application Management
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Platform-wide application moderation, candidate pipelines, and status history
          </p>
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
              className="w-full rounded-xl border pl-10 pr-4 py-2 text-xs font-medium focus:outline-none"
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
                <option value="SHORTLISTED">Shortlist Selected</option>
                <option value="SELECTED">Select / Hire Selected</option>
                <option value="REJECTED">Reject Selected</option>
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
            <Users className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>
              {searchQuery ? `No applications match "${searchQuery}"` : "No applications found"}
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
                    <th className="px-6 py-3.5 font-bold uppercase">Status</th>
                    <th className="px-6 py-3.5 font-bold uppercase">Applied Date</th>
                    <th className="px-6 py-3.5 font-bold uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {filteredApps.map((app) => {
                    const isSelected = selectedIds.includes(app.id);
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
                          {app.job?.company?.name || "Verified Enterprise"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            app.status === "SELECTED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
                            app.status === "REJECTED" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" :
                            app.status === "SHORTLISTED" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" :
                            "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatusChange(app.id, "SHORTLISTED")}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold text-[10px] hover:bg-indigo-100 transition"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, "SELECTED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold text-[10px] hover:bg-emerald-100 transition"
                            >
                              Select
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, "REJECTED")}
                              className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-semibold text-[10px] hover:bg-red-100 transition"
                            >
                              Reject
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
