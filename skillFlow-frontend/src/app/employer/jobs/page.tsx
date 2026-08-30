"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { jobApi } from "@/services/job.api";
import { useToast } from "@/context/ToastContext";
import { useEmployerVerification } from "@/hooks/useEmployerVerification";
import { Briefcase, PlusCircle, ArrowLeft, Trash2, Search, ShieldAlert } from "lucide-react";

function EmployerJobsContent() {
  const router = useRouter();
  const { isVerified, verifyOrWarn } = useEmployerVerification();
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobApi.getEmployerJobs();
      if (res.success && res.data) {
        setJobs(Array.isArray(res.data) ? res.data : res.data.jobs || []);
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
    const location = (j.location || "").toLowerCase();
    const workType = (j.workType || "").toLowerCase();
    return title.includes(query) || location.includes(query) || workType.includes(query);
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredJobs.length && filteredJobs.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredJobs.map((j) => j.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected job postings?`)) {
      try {
        await Promise.all(selectedIds.map((id) => jobApi.deleteJob(id)));
        toast.success(`Deleted ${selectedIds.length} job postings.`);
        setSelectedIds([]);
        fetchJobs();
      } catch {
        toast.error("Failed to bulk delete jobs.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      const res = await jobApi.deleteJob(id);
      if (res.success) {
        toast.success("Job posting deleted successfully.");
        setJobs((prev) => prev.filter((j) => j.id !== id));
      } else {
        toast.error(res.message || "Failed to delete job.");
      }
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen py-10 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/employer/dashboard" className="text-xs font-semibold text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 mb-2 transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Manage Job Postings</h1>
            <p className="text-xs text-slate-400 mt-0.5">Control publication status and monitor applicant volume</p>
          </div>
          <button
            onClick={() => verifyOrWarn(() => router.push("/employer/jobs/create"))}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition shadow-md shrink-0 ${
              isVerified ? "bg-indigo-600 hover:bg-indigo-500" : "bg-gray-600 hover:bg-gray-500 cursor-not-allowed"
            }`}
          >
            <PlusCircle className="h-4 w-4" /> Create Opening
          </button>
        </div>

        {!isVerified && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <span className="font-bold block text-sm">Company Verification Required</span>
                Your company profile must be verified by an administrator before you can post jobs.
              </div>
            </div>
            <Link href="/employer/dashboard" className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 shrink-0">
              Submit Details
            </Link>
          </div>
        )}

        {/* Search Bar & Multi-Select Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search postings by Job Title, Location, or Work Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {filteredJobs.length > 0 && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 shadow-sm text-slate-200">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredJobs.length && filteredJobs.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span>Select All ({selectedIds.length} / {filteredJobs.length})</span>
              </label>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition shadow-sm"
                >
                  <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.length})
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">
            <Briefcase className="h-10 w-10 text-slate-500 mx-auto mb-3" />
            <h3 className="font-bold text-white text-sm">
              {searchQuery ? `No postings match "${searchQuery}"` : "No postings yet"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Post your first position to receive candidate profiles.</p>
            <button
              onClick={() => verifyOrWarn(() => router.push("/employer/jobs/create"))}
              className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition ${
                isVerified ? "bg-indigo-600 hover:bg-indigo-500" : "bg-gray-600 hover:bg-gray-500 cursor-not-allowed"
              }`}
            >
              Create Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const isSelected = selectedIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  className={`rounded-2xl border ${
                    isSelected ? "border-indigo-500 bg-indigo-950/40" : "border-slate-800 bg-slate-900"
                  } p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(job.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2.5 py-0.5 text-xs font-bold">
                          {job.status}
                        </span>
                        <span className="text-xs text-slate-400">{job.workType} • {job.jobType}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{job.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">Location: {job.location || "Remote"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-800/50 px-3 py-1.5 rounded-xl">
                      {job._count?.applications || job.applications?.length || 0} applicants
                    </span>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                    >
                      Public View
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition"
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

export default function EmployerJobsPage() {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]}>
      <EmployerJobsContent />
    </ProtectedRoute>
  );
}
