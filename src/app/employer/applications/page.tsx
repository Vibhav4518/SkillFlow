"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { jobApi } from "@/services/job.api";
import { applicationApi } from "@/services/application.api";
import { bookmarkApi } from "@/services/bookmark.api";
import { useToast } from "@/context/ToastContext";
import { Users, ArrowLeft, Bookmark } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  IN_PROGRESS: "In Progress",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  SELECTED: "Selected (Hire)",
  REJECTED: "Rejected",
};

const STATUS_BADGE: Record<string, string> = {
  SELECTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  INTERVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  SHORTLISTED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
};

function EmployerApplicationsContent() {
  const toast = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await jobApi.getEmployerJobs();
        if (res?.success && res?.data) {
          setJobs(res.data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingApps(true);
        const res = await applicationApi.getJobApplications(selectedJobId || "ALL");
        if (res?.success && res?.data) setApplications(res.data);
        else setApplications([]);
        setSelectedIds([]);
      } finally {
        setLoadingApps(false);
      }
    })();
  }, [selectedJobId]);

  const [bookmarkedAppIds, setBookmarkedAppIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    bookmarkApi.getBookmarks().then((res) => {
      if (res?.success && Array.isArray(res.data)) {
        const map: Record<string, boolean> = {};
        res.data.forEach((b: any) => {
          if (b.applicationId) map[b.applicationId] = true;
        });
        setBookmarkedAppIds(map);
      }
    }).catch(() => {});
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map((a) => a.id));
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.length === 0) return;
    if (confirm(`Update status of ${selectedIds.length} candidates to ${STATUS_LABELS[status] || status}?`)) {
      try {
        await Promise.all(selectedIds.map((id) => applicationApi.updateStatus(id, status)));
        toast.success(`Updated ${selectedIds.length} candidate application statuses.`);
        setApplications((prev) =>
          prev.map((a) => (selectedIds.includes(a.id) ? { ...a, status } : a))
        );
        setSelectedIds([]);
      } catch {
        toast.error("Failed to perform bulk status update.");
      }
    }
  };

  const handleToggleBookmarkApp = async (appId: string, candName: string) => {
    try {
      const res = await bookmarkApi.toggleBookmark({ applicationId: appId, type: "APPLICATION" });
      if (res?.success) {
        setBookmarkedAppIds((prev) => ({ ...prev, [appId]: res.bookmarked }));
        toast.success(res.message || (res.bookmarked ? `Bookmarked ${candName}'s application` : `Unbookmarked ${candName}'s application`));
      } else {
        toast.error("Failed to bookmark application.");
      }
    } catch {
      toast.error("Error updating application bookmark.");
    }
  };

  const handleStatusChange = async (appId: string, status: string, candidateName: string) => {
    const res = await applicationApi.updateStatus(appId, status);
    if (res?.success !== false) {
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
      toast.success(`${candidateName}'s status updated to ${STATUS_LABELS[status] || status}.`);
    } else {
      toast.error(res?.message || "Failed to update status.");
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-bg-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/employer/dashboard" className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80" style={{ color: "var(--color-text-muted)" }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>Candidate Pipeline</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Review submissions and progress candidates through hiring stages</p>
          </div>

          {jobs.length > 0 && (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="rounded-xl border px-4 py-2 text-sm font-semibold focus:outline-none"
              style={inputStyle}
            >
              <option value="">All Job Postings (Global Pipeline)</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j._count?.applications ?? 0} applicants)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Multi-Select Toolbar */}
        {applications.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--color-text)" }}>
              <input
                type="checkbox"
                checked={selectedIds.length === applications.length && applications.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Select All ({selectedIds.length} / {applications.length} selected)</span>
            </label>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Bulk Update Status:</span>
                <select
                  onChange={(e) => e.target.value && handleBulkStatusChange(e.target.value)}
                  defaultValue=""
                  className="rounded-xl border px-3 py-1.5 text-xs font-semibold focus:outline-none"
                  style={inputStyle}
                >
                  <option value="" disabled>Select Status...</option>
                  {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {loading || loadingApps ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border p-6 animate-pulse" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <div className="h-5 w-48 rounded" style={{ backgroundColor: "var(--color-bg-muted)" }} />
                <div className="h-3 w-72 rounded mt-3" style={{ backgroundColor: "var(--color-bg-muted)" }} />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Users className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-text-subtle)" }} />
            <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>No applications for this opening yet</h3>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Candidates applying to this position will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const candName = app.candidate?.user?.fullName || "Candidate";
              const isBookmarked = Boolean(bookmarkedAppIds[app.id]);
              const isSelected = selectedIds.includes(app.id);

              return (
                <div
                  key={app.id}
                  className={`rounded-3xl border p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-start justify-between gap-6 transition ${
                    isSelected ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
                  }`}
                  style={{ backgroundColor: isSelected ? undefined : "var(--color-bg-card)", borderColor: isSelected ? undefined : "var(--color-border)" }}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(app.id)}
                      className="mt-1.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold border ${STATUS_BADGE[app.status] || STATUS_BADGE.APPLIED}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
                        {candName}
                      </h3>
                      <button
                        onClick={() => handleToggleBookmarkApp(app.id, candName)}
                        className="p-1 rounded-lg transition hover:opacity-80"
                        style={{ color: isBookmarked ? "rgb(234, 179, 8)" : "var(--color-text-muted)" }}
                        title={isBookmarked ? "Remove bookmark" : "Bookmark candidate application"}
                      >
                        <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <p className="text-xs font-medium mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {app.candidate?.headline || "Experienced Candidate"}{app.candidate?.location ? ` • ${app.candidate.location}` : ""}
                    </p>

                    {app.coverLetter && (
                      <div className="mt-3 rounded-xl p-3 text-xs border" style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                        <span className="font-semibold block mb-1" style={{ color: "var(--color-text)" }}>Cover Note:</span>
                        {app.coverLetter}
                      </div>
                    )}

                    {app.candidate?.skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {app.candidate.skills.slice(0, 6).map((s: any, idx: number) => (
                          <span key={idx} className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }}>
                            {s.skill?.name || s.name || s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                  <div className="shrink-0">
                    <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>Update Status</label>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value, candName)}
                      className="rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none min-w-[160px]"
                      style={inputStyle}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployerApplicationsPage() {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]}>
      <EmployerApplicationsContent />
    </ProtectedRoute>
  );
}
