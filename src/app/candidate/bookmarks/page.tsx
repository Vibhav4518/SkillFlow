"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import { bookmarkApi } from "@/services/bookmark.api";
import { useToast } from "@/context/ToastContext";
import { Bookmark, Building2, MapPin, Briefcase, Trash2, ArrowRight, DollarSign } from "lucide-react";

function CandidateBookmarksContent() {
  const toast = useToast();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await bookmarkApi.getBookmarks();
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setBookmarks(res.data);
        }
      } catch {
        if (isMounted) toast.error("Failed to load bookmarked jobs.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === bookmarks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bookmarks.map((b) => b.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Remove ${selectedIds.length} selected bookmarks?`)) {
      try {
        await Promise.all(selectedIds.map((id) => bookmarkApi.deleteBookmark(id)));
        toast.success(`Removed ${selectedIds.length} bookmarks`);
        setSelectedIds([]);
        loadBookmarks();
      } catch {
        toast.error("Error removing bookmarks.");
      }
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string, jobTitle: string) => {
    try {
      const res = await bookmarkApi.deleteBookmark(bookmarkId);
      if (res?.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
        toast.success(`Removed "${jobTitle}" from bookmarks`);
      } else {
        toast.error("Failed to remove bookmark.");
      }
    } catch {
      toast.error("Error removing bookmark.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="rounded-3xl border p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full px-3 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                Candidate Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <Bookmark className="h-7 w-7 text-indigo-600" /> Bookmarked Jobs ({bookmarks.length})
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Your saved job listings for quick application and review.
            </p>
          </div>

          <Link
            href="/jobs"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
          >
            Browse More Jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Multi-Select Bulk Action Toolbar */}
        {bookmarks.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--color-text)" }}>
              <input
                type="checkbox"
                checked={selectedIds.length === bookmarks.length && bookmarks.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Select All ({selectedIds.length} / {bookmarks.length} selected)</span>
            </label>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm"
              >
                <Trash2 className="h-4 w-4" /> Remove Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {/* Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-bold text-base" style={{ color: "var(--color-text)" }}>No bookmarked jobs yet</h3>
            <p className="text-xs mt-1 mb-6" style={{ color: "var(--color-text-muted)" }}>
              Click the bookmark icon on any job listing to save it here for later.
            </p>
            <Link
              href="/jobs"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              Explore Job Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((b) => {
              const job = b.job || {};
              const company = job.company || {};
              const isSelected = selectedIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-3xl border p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition ${
                    isSelected ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
                  }`}
                  style={{ backgroundColor: isSelected ? undefined : "var(--color-bg-card)", borderColor: isSelected ? undefined : "var(--color-border)" }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(b.id)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        {company.logoUrl ? (
                          <Image src={company.logoUrl} alt={company.name} width={44} height={44} className="h-11 w-11 rounded-xl object-cover border" unoptimized />
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
                            {(company.name || "C")[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>{company.name || "Company"}</p>
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            {job.workType || "Full-time"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveBookmark(b.id, job.title || "Job")}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        title="Remove bookmark"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-base font-bold line-clamp-1" style={{ color: "var(--color-text)" }}>
                        {job.title || "Untitled Job"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                          {job.location || "Remote"}
                        </span>
                        {job.salaryMin && job.salaryMax && (
                          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="h-3.5 w-3.5" />
                            ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills.slice(0, 3).map((s: any, i: number) => (
                          <span key={i} className="rounded-md border px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                            {s.skill?.name || s.name || s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t pt-4 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                    <span className="text-[11px]" style={{ color: "var(--color-text-subtle)" }}>
                      Saved {new Date(b.createdAt).toLocaleDateString()}
                    </span>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                    >
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
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

export default function CandidateBookmarksPage() {
  return (
    <ProtectedRoute allowedRoles={["CANDIDATE"]}>
      <CandidateBookmarksContent />
    </ProtectedRoute>
  );
}
