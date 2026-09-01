"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { jobApi } from "@/services/job.api";
import { useToast } from "@/context/ToastContext";
import { useEmployerVerification } from "@/hooks/useEmployerVerification";
import {
  Briefcase, PlusCircle, ArrowLeft, Trash2, Search, ShieldAlert,
  Edit2, Eye, X, Save, CheckCircle2
} from "lucide-react";

function EmployerJobsContent() {
  const router = useRouter();
  const { isVerified, verifyOrWarn } = useEmployerVerification();
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Edit Modal State
  const [editingJob, setEditingJob] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    workType: "REMOTE",
    jobType: "FULL_TIME",
    status: "PUBLISHED",
    description: "",
    salaryMin: "",
    salaryMax: "",
  });

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

  const handleOpenEdit = (job: any) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || "",
      location: job.location || "",
      workType: job.workType || "REMOTE",
      jobType: job.jobType || "FULL_TIME",
      status: job.status || "PUBLISHED",
      description: job.description || "",
      salaryMin: job.salaryMin ? String(job.salaryMin) : "",
      salaryMax: job.salaryMax ? String(job.salaryMax) : "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob?.id) return;
    try {
      setSavingEdit(true);
      const payload: any = {
        title: editForm.title,
        location: editForm.location,
        workType: editForm.workType,
        jobType: editForm.jobType,
        status: editForm.status,
        description: editForm.description,
        salaryMin: editForm.salaryMin ? Number(editForm.salaryMin) : undefined,
        salaryMax: editForm.salaryMax ? Number(editForm.salaryMax) : undefined,
      };

      const res = await jobApi.updateJob(editingJob.id, payload);
      if (res?.success !== false) {
        toast.success(`Updated "${editForm.title}" successfully.`);
        setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? { ...j, ...payload } : j)));
        setEditingJob(null);
      } else {
        toast.error(res?.message || "Failed to update job posting.");
      }
    } catch {
      toast.error("Error saving job changes.");
    } finally {
      setSavingEdit(false);
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

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const res = await jobApi.deleteJob(id);
      if (res.success) {
        toast.success(`Deleted "${title}".`);
        setJobs((prev) => prev.filter((j) => j.id !== id));
      } else {
        toast.error(res.message || "Failed to delete job.");
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/employer/dashboard" className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80 transition" style={{ color: "var(--color-text-muted)" }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>Manage Job Postings</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Control job status, edit job details, and monitor applicant volume</p>
          </div>
          <button
            onClick={() => verifyOrWarn(() => router.push("/employer/jobs/create"))}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition shadow-md shrink-0 ${
              isVerified ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
            }`}
          >
            <PlusCircle className="h-4 w-4" /> Create Opening
          </button>
        </div>

        {!isVerified && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold block text-sm">Company Verification Required</span>
                Your company profile must be verified by an administrator before you can post jobs.
              </div>
            </div>
            <Link href="/employer/dashboard" className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 shrink-0">
              Submit Details
            </Link>
          </div>
        )}

        {/* Search Bar & Multi-Select Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search postings by Job Title, Location, or Work Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none shadow-sm"
              style={inputStyle}
            />
          </div>

          {filteredJobs.length > 0 && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-2 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--color-text)" }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredJobs.length && filteredJobs.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Select All ({selectedIds.length} / {filteredJobs.length})</span>
              </label>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm"
                >
                  <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.length})
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Briefcase className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>
              {searchQuery ? `No postings match "${searchQuery}"` : "No postings yet"}
            </h3>
            <p className="text-xs mt-1 mb-4" style={{ color: "var(--color-text-muted)" }}>Post your first position to receive candidate profiles.</p>
            <button
              onClick={() => verifyOrWarn(() => router.push("/employer/jobs/create"))}
              className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition ${
                isVerified ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
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
                  className={`rounded-2xl border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    isSelected ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
                  }`}
                  style={{ backgroundColor: isSelected ? undefined : "var(--color-bg-card)", borderColor: isSelected ? undefined : "var(--color-border)" }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(job.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          job.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200" :
                          job.status === "UNDER_REVIEW" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200" :
                          job.status === "REJECTED" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200" :
                          job.status === "CLOSED" ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200" :
                          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200"
                        }`}>
                          {job.status}
                        </span>
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{job.workType} • {job.jobType}</span>
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{job.title}</h3>
                      <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Location: {job.location || "Remote"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      {job.applicationsCount ?? job._count?.applications ?? job.applications?.length ?? 0} candidate applicants
                    </span>
                    <button
                      onClick={() => handleOpenEdit(job)}
                      className="flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    >
                      <Edit2 className="h-3.5 w-3.5 text-indigo-500" /> Edit
                    </button>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    >
                      <Eye className="h-3.5 w-3.5 text-blue-500" /> View
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id, job.title)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      title="Delete job"
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

      {/* EDIT JOB MODAL */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border p-6 sm:p-8 shadow-2xl space-y-5 my-8" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <Edit2 className="h-5 w-5 text-indigo-600" /> Edit Job Posting
              </h3>
              <button onClick={() => setEditingJob(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Job Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-xl border px-3.5 py-2 text-xs focus:outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, Lucknow, Bangalore"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Publication Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Work Arrangement</label>
                  <select
                    value={editForm.workType}
                    onChange={(e) => setEditForm({ ...editForm, workType: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="ONSITE">Onsite</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Employment Type</label>
                  <select
                    value={editForm.jobType}
                    onChange={(e) => setEditForm({ ...editForm, jobType: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Min Salary (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={editForm.salaryMin}
                    onChange={(e) => setEditForm({ ...editForm, salaryMin: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Max Salary (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1200000"
                    value={editForm.salaryMax}
                    onChange={(e) => setEditForm({ ...editForm, salaryMax: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Job Description</label>
                <textarea
                  rows={4}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border px-3.5 py-2 text-xs focus:outline-none resize-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="rounded-xl border px-4 py-2 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <Save className="h-4 w-4" />
                  {savingEdit ? "Saving..." : "Save Job Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
