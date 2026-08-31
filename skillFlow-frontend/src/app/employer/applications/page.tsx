"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { jobApi } from "@/services/job.api";
import { applicationApi } from "@/services/application.api";
import { bookmarkApi } from "@/services/bookmark.api";
import { useToast } from "@/context/ToastContext";
import { Users, ArrowLeft, Bookmark, User, FileText, Trash2, Search } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  IN_PROGRESS: "In Progress",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  SELECTED: "Selected (Hire)",
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

function EmployerApplicationsContent() {
  const toast = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [bookmarkedAppIds, setBookmarkedAppIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await jobApi.getEmployerJobs();
        if (res?.success && res?.data) {
          setJobs(Array.isArray(res.data) ? res.data : res.data.jobs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await applicationApi.getJobApplications(selectedJobId || "ALL");
      if (res?.success && res?.data) {
        setApplications(res.data);
      } else {
        setApplications([]);
      }
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedJobId]);

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

  // Filtered applications by status and search query
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (statusFilter !== "ALL" && app.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const candName = (app.candidate?.user?.fullName || "").toLowerCase();
        const headline = (app.candidate?.headline || "").toLowerCase();
        const location = (app.candidate?.location || "").toLowerCase();
        const jobTitle = (app.job?.title || "").toLowerCase();
        const skills = (app.candidate?.skills || []).map((s: any) => (s.skill?.name || s.name || s).toString().toLowerCase()).join(" ");

        return candName.includes(q) || headline.includes(q) || location.includes(q) || jobTitle.includes(q) || skills.includes(q);
      }
      return true;
    });
  }, [applications, statusFilter, searchQuery]);

  // Counts per status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: applications.length };
    Object.keys(STATUS_LABELS).forEach((st) => {
      counts[st] = 0;
    });
    applications.forEach((a) => {
      if (a.status) {
        counts[a.status] = (counts[a.status] || 0) + 1;
      }
    });
    return counts;
  }, [applications]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredApplications.length && filteredApplications.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map((a) => a.id));
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.length === 0) return;
    if (confirm(`Update status of ${selectedIds.length} candidate applications to ${STATUS_LABELS[status] || status}?`)) {
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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected candidate applications?`)) {
      try {
        await Promise.all(selectedIds.map((id) => applicationApi.withdrawApplication(id)));
        toast.success(`Deleted ${selectedIds.length} applications.`);
        setApplications((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
        setSelectedIds([]);
      } catch {
        toast.error("Failed to bulk delete applications.");
      }
    }
  };

  const handleDeleteApp = async (appId: string, candName: string) => {
    if (confirm(`Delete application for ${candName}?`)) {
      try {
        const res = await applicationApi.withdrawApplication(appId);
        if (res?.success !== false) {
          toast.success(`Deleted application for ${candName}.`);
          setApplications((prev) => prev.filter((a) => a.id !== appId));
          setSelectedIds((prev) => prev.filter((id) => id !== appId));
        } else {
          toast.error(res?.message || "Failed to delete application.");
        }
      } catch {
        toast.error("Error deleting application.");
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/employer/dashboard" className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80 transition" style={{ color: "var(--color-text-muted)" }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>Candidate Application Pipeline</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Review candidate submissions, filter by stage, and manage status updates</p>
          </div>

          {jobs.length > 0 && (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold focus:outline-none shadow-sm shrink-0"
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

        {/* Search & Multi-Select Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name, skill, position, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none"
              style={inputStyle}
            />
          </div>

          {filteredApplications.length > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-2 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--color-text)" }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Select All ({selectedIds.length} / {filteredApplications.length})</span>
              </label>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => e.target.value && handleBulkStatusChange(e.target.value)}
                    defaultValue=""
                    className="rounded-xl border px-3 py-1.5 text-xs font-semibold focus:outline-none"
                    style={inputStyle}
                  >
                    <option value="" disabled>Bulk Status...</option>
                    {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>

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
        </div>

        {/* Applications List */}
        {loading || loadingApps ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border p-6 animate-pulse" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <div className="h-5 w-48 rounded" style={{ backgroundColor: "var(--color-bg-muted)" }} />
                <div className="h-3 w-72 rounded mt-3" style={{ backgroundColor: "var(--color-bg-muted)" }} />
              </div>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Users className="h-10 w-10 mx-auto mb-3 text-slate-400" />
            <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>
              {searchQuery || statusFilter !== "ALL" ? "No applications match your filter criteria" : "No applications found"}
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              {statusFilter !== "ALL" ? `No candidates in "${STATUS_LABELS[statusFilter] || statusFilter}" status.` : "Candidate applications will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
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
                      className="mt-3 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />

                    {/* Candidate Avatar */}
                    <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-slate-700 bg-slate-800 flex items-center justify-center">
                      {app.candidate?.profilePhotoUrl ? (
                        <img
                          src={app.candidate.profilePhotoUrl}
                          alt={candName}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as any).onerror = null; (e.target as any).src = '/images/profileIcon.png'; }}
                        />
                      ) : (
                        <User className="h-6 w-6 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold border ${STATUS_BADGE[app.status] || STATUS_BADGE.APPLIED}`}>
                          {STATUS_LABELS[app.status] || app.status}
                        </span>
                        <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                          Applied {new Date(app.appliedAt || app.appliedDate || Date.now()).toLocaleDateString()}
                        </span>
                        {app.job?.title && (
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                            Job: {app.job.title}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
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

                        {(app.resumeUrl || app.resume || app.candidate?.resumeUrl || app.candidate?.resume?.url) && (
                          <a
                            href={app.resumeUrl || app.resume || app.candidate?.resumeUrl || app.candidate?.resume?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
                          >
                            <FileText className="h-3.5 w-3.5" /> View Resume
                          </a>
                        )}
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

                  <div className="flex items-center gap-3 shrink-0">
                    <div>
                      <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>Stage</label>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value, candName)}
                        className="rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none min-w-[150px]"
                        style={inputStyle}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleDeleteApp(app.id, candName)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition mt-5"
                      title="Delete application"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
