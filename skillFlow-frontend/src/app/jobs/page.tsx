"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { jobApi, JobFilterParams } from "@/services/job.api";
import { bookmarkApi } from "@/services/bookmark.api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Search, MapPin, Briefcase, Filter, ArrowRight, Building, Clock, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";

function JobsExploreContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<JobFilterParams>(() => ({
    search: searchParams?.get("search") || "",
    location: searchParams?.get("location") || "",
    workType: searchParams?.get("workType") || "",
    jobType: searchParams?.get("jobType") || "",
    page: 1,
    limit: 9,
  }));

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await jobApi.getJobs(filters);
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          setJobs(res.data);
          setTotal(res.data.length);
          setTotalPages(1);
        } else {
          setJobs(res.data.jobs || res.data.items || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const inputStyle = {
    backgroundColor: "var(--color-bg-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAuthenticated) {
      bookmarkApi.getBookmarks().then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          const map: Record<string, boolean> = {};
          res.data.forEach((b: any) => {
            if (b.jobId) map[b.jobId] = true;
          });
          setBookmarkedJobIds(map);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleToggleJobBookmark = async (jobId: string, jobTitle: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark jobs");
      return;
    }
    try {
      const res = await bookmarkApi.toggleBookmark({ jobId, type: "JOB" });
      if (res?.success) {
        setBookmarkedJobIds((prev) => ({ ...prev, [jobId]: res.bookmarked }));
        toast.success(res.message || (res.bookmarked ? `Saved "${jobTitle}" to bookmarks` : `Removed "${jobTitle}" from bookmarks`));
      } else {
        toast.error("Failed to update bookmark.");
      }
    } catch {
      toast.error("Error updating bookmark.");
    }
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>Explore Open Roles</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Discover opportunities matched with your career profile</p>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-8 rounded-2xl p-4 border shadow-sm flex flex-col md:flex-row gap-3" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="flex flex-1 items-center gap-2 px-3 py-2 border rounded-xl" style={inputStyle}>
            <Search className="h-4 w-4 shrink-0" style={{ color: "var(--color-text-muted)" }} />
            <input
              type="text"
              placeholder="Search title, role, skill..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-transparent text-sm focus:outline-none"
              style={{ color: "var(--color-text)" }}
            />
          </div>

          <div className="flex flex-1 items-center gap-2 px-3 py-2 border rounded-xl" style={inputStyle}>
            <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--color-text-muted)" }} />
            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full bg-transparent text-sm focus:outline-none"
              style={{ color: "var(--color-text)" }}
            />
          </div>

          <select
            value={filters.workType}
            onChange={(e) => setFilters({ ...filters, workType: e.target.value, page: 1 })}
            className="rounded-xl border px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          >
            <option value="">All Work Types</option>
            <option value="REMOTE">Remote</option>
            <option value="ONSITE">Onsite</option>
            <option value="HYBRID">Hybrid</option>
          </select>

          <select
            value={filters.jobType}
            onChange={(e) => setFilters({ ...filters, jobType: e.target.value, page: 1 })}
            className="rounded-xl border px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          >
            <option value="">All Job Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
          >
            Filter
          </button>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-t-transparent" />
              <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Searching active opportunities...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Briefcase className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--color-text-subtle)" }} />
            <h3 className="text-base font-bold" style={{ color: "var(--color-text)" }}>No jobs match your criteria</h3>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Try resetting filters or searching for different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const isSaved = Boolean(bookmarkedJobIds[job.id]);

              return (
                <div
                  key={job.id}
                  className="flex flex-col justify-between rounded-2xl border p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition"
                  style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                        {job.workType || "Full-time"}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {job.salaryMin && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
                          </span>
                        )}
                        <button
                          onClick={() => handleToggleJobBookmark(job.id, job.title)}
                          className="p-1 rounded-lg transition hover:opacity-80"
                          style={{ color: isSaved ? "rgb(234, 179, 8)" : "var(--color-text-muted)" }}
                          title={isSaved ? "Remove from bookmarks" : "Save to bookmarks"}
                        >
                          <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>

                    <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{job.title}</h2>
                    <p className="text-sm font-medium mt-0.5" style={{ color: "var(--color-text-muted)" }}>{job.company?.name || "SkillFlow Verified Partner"}</p>

                    <p className="text-xs line-clamp-3 mt-3 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                      {job.description}
                    </p>

                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 3).map((s: any, idx: number) => (
                          <span key={idx} className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: "var(--color-bg-muted)", color: "var(--color-text)" }}>
                            {s.skill?.name || s.name || s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t pt-4 flex items-center justify-between text-xs" style={{ borderColor: "var(--color-border)" }}>
                    <span className="flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                      <MapPin className="h-3.5 w-3.5" style={{ color: "var(--color-text-subtle)" }} />
                      {job.location || "Remote"}
                    </span>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="rounded-xl px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                    >
                      View & Apply
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              className="flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="px-4 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Page {filters.page} of {totalPages}
            </span>
            <button
              disabled={filters.page === totalPages}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              className="flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobsExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <JobsExploreContent />
    </Suspense>
  );
}
