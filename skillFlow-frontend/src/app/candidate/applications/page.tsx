"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { applicationApi } from "@/services/application.api";
import { useToast } from "@/context/ToastContext";
import { Briefcase, ArrowLeft, Building2, Calendar, AlertCircle } from "lucide-react";

function CandidateApplicationsContent() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationApi.getCandidateApplications();
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
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

  const handleBulkWithdraw = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Withdraw ${selectedIds.length} selected applications?`)) {
      try {
        await Promise.all(selectedIds.map((id) => applicationApi.withdrawApplication(id)));
        toast.success(`Successfully processed ${selectedIds.length} application withdrawals.`);
        setSelectedIds([]);
        fetchApplications();
      } catch {
        toast.error("Error performing bulk withdraw.");
      }
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (confirm("Are you sure you want to withdraw this application?")) {
      try {
        const res = await applicationApi.withdrawApplication(applicationId);
        if (res.success) {
          toast.success("Application withdrawn successfully.");
          fetchApplications();
        } else {
          toast.error(res.message || "Failed to withdraw application.");
        }
      } catch (err) {
        toast.error("Network error while withdrawing application.");
      }
    }
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/candidate/dashboard" className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80 transition" style={{ color: "var(--color-text-muted)" }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>Application Pipeline</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Real-time status updates and submission records</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/jobs" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm">
              Apply to More Roles
            </Link>
          </div>
        </div>

        {/* Multi-Select Toolbar */}
        {applications.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
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
              <button
                onClick={handleBulkWithdraw}
                className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm"
              >
                Withdraw Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Briefcase className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>No applications found</h3>
            <p className="text-xs mt-1 mb-4" style={{ color: "var(--color-text-muted)" }}>Start discovering open positions on SkillFlow.</p>
            <Link href="/jobs" className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm">
              Browse Openings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const status = app.status === "SHORTLISTED" || app.status === "INTERVIEW" || app.status === "IN_PROGRESS" ? "APPLIED" : (app.status || "APPLIED");
              const isSelected = selectedIds.includes(app.id);

              return (
                <div
                  key={app.id}
                  className={`rounded-3xl border p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition ${
                    isSelected ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
                  }`}
                  style={{ backgroundColor: isSelected ? undefined : "var(--color-bg-card)", borderColor: isSelected ? undefined : "var(--color-border)" }}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(app.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`rounded-full px-3 py-0.5 text-xs font-bold border ${
                          status === "SELECTED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200" :
                          status === "REJECTED" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200" :
                          status === "WITHDRAWN" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200" :
                          "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200"
                        }`}>
                          Status: {status}
                        </span>
                        <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                          Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{app.job?.title || "Position"}</h3>
                      <p className="text-sm font-semibold flex items-center gap-1.5 mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        <Building2 className="h-4 w-4 text-indigo-500" />
                        {app.job?.company?.name || "SkillFlow Verified Enterprise"}
                      </p>

                      {app.coverLetter && (
                        <div className="mt-3 rounded-xl p-3 text-xs border" style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)", color: "var(--color-text)" }}>
                          <span className="font-semibold block mb-1" style={{ color: "var(--color-text-muted)" }}>Cover Note:</span>
                          {app.coverLetter}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {status !== "WITHDRAWN" && status !== "REJECTED" && status !== "SELECTED" && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        className="rounded-xl border border-red-200 dark:border-red-800/60 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      >
                        Withdraw
                      </button>
                    )}
                    {app.job?.id && (
                      <Link
                        href={`/jobs/${app.job.id}`}
                        className="rounded-xl border px-4 py-2 text-xs font-semibold transition hover:bg-gray-100 dark:hover:bg-gray-800"
                        style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                      >
                        View Job Details
                      </Link>
                    )}
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

export default function CandidateApplicationsPage() {
  return (
    <ProtectedRoute allowedRoles={["CANDIDATE"]}>
      <CandidateApplicationsContent />
    </ProtectedRoute>
  );
}
