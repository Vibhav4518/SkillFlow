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
    <div className="bg-gray-50/50 dark:bg-gray-950 min-h-screen py-10 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/candidate/dashboard" className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 inline-flex items-center gap-1 mb-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Application Pipeline</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Real-time status updates and submission records</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/jobs" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              Apply to More Roles
            </Link>
          </div>
        </div>

        {/* Multi-Select Toolbar */}
        {applications.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 shadow-sm">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === applications.length && applications.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Select All ({selectedIds.length} / {applications.length} selected)</span>
            </label>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkWithdraw}
                className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition"
              >
                Withdraw Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
            <Briefcase className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">No applications found</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">Start discovering open positions on SkillFlow.</p>
            <Link href="/jobs" className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white">
              Browse Openings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className={`rounded-3xl border ${
                  selectedIds.includes(app.id) ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20" : "border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900"
                } p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(app.id)}
                    onChange={() => handleToggleSelect(app.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        app.status === "SELECTED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" :
                        app.status === "REJECTED" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800" :
                        app.status === "WITHDRAWN" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700" :
                        app.status === "INTERVIEW" ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800" :
                        app.status === "SHORTLISTED" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" :
                        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      }`}>
                        Status: {app.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{app.job?.title || "Position"}</h3>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {app.job?.company?.name || "SkillFlow Verified Enterprise"}
                    </p>

                    {app.coverLetter && (
                      <div className="mt-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 text-xs text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                        <span className="font-semibold text-gray-700 dark:text-gray-200 block mb-1">Cover Note:</span>
                        {app.coverLetter}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {app.status !== "WITHDRAWN" && app.status !== "REJECTED" && app.status !== "SELECTED" && (
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
                      className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      View Job Details
                    </Link>
                  )}
                </div>
              </div>
            ))}
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
