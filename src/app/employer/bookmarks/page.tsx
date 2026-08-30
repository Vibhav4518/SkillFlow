"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { bookmarkApi } from "@/services/bookmark.api";
import { useToast } from "@/context/ToastContext";
import { Bookmark, User, Briefcase, Mail, Phone, Trash2, ArrowRight, Eye, CheckCircle2 } from "lucide-react";

function EmployerBookmarksContent() {
  const toast = useToast();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadBookmarks = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

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
        if (isMounted) toast.error("Failed to load bookmarked applications.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [refreshTrigger, toast]);

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

  const handleRemoveBookmark = async (bookmarkId: string, candidateName: string) => {
    try {
      const res = await bookmarkApi.deleteBookmark(bookmarkId);
      if (res?.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
        toast.success(`Removed "${candidateName}" from bookmarked applications`);
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
                Employer Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <Bookmark className="h-7 w-7 text-indigo-600" /> Bookmarked Applications ({bookmarks.length})
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Shortlisted &amp; saved candidate application profiles for active positions.
            </p>
          </div>

          <Link
            href="/employer/applications"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
          >
            All Applications <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Multi-Select Toolbar */}
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

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-bold text-base" style={{ color: "var(--color-text)" }}>No bookmarked applications yet</h3>
            <p className="text-xs mt-1 mb-6" style={{ color: "var(--color-text-muted)" }}>
              Click the bookmark icon on any candidate application to save it here for evaluation.
            </p>
            <Link
              href="/employer/applications"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              View Application Pipeline
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map((b) => {
              const app = b.application || {};
              const job = app.job || {};
              const cand = app.candidate || {};
              const candUser = cand.user || {};
              const candName = candUser.fullName || cand.headline || "Candidate Profile";
              const isSelected = selectedIds.includes(b.id);

              return (
                <div
                  key={b.id}
                  className={`rounded-3xl border p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-4 ${
                    isSelected ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
                  }`}
                  style={{ backgroundColor: isSelected ? undefined : "var(--color-bg-card)", borderColor: isSelected ? undefined : "var(--color-border)" }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(b.id)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg">
                          {(candName || "C")[0]}
                        </div>
                        <div>
                          <h3 className="text-base font-bold" style={{ color: "var(--color-text)" }}>{candName}</h3>
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {cand.headline || "Candidate"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase ${
                          app.status === "SELECTED" ? "bg-emerald-100 text-emerald-800" :
                          app.status === "SHORTLISTED" ? "bg-indigo-100 text-indigo-800" :
                          app.status === "INTERVIEW" ? "bg-purple-100 text-purple-800" :
                          app.status === "REJECTED" ? "bg-red-100 text-red-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {app.status || "APPLIED"}
                        </span>
                        <button
                          onClick={() => handleRemoveBookmark(b.id, candName)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          title="Remove bookmark"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border space-y-1 text-xs" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)" }}>
                      <p className="font-bold text-gray-500 text-[10px] uppercase">Applied Position</p>
                      <p className="font-bold text-sm" style={{ color: "var(--color-text)" }}>{job.title || "Job Opening"}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {candUser.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-indigo-500" /> {candUser.email}
                        </span>
                      )}
                      {cand.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-emerald-500" /> {cand.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                    <span className="text-[11px]" style={{ color: "var(--color-text-subtle)" }}>
                      Saved {new Date(b.createdAt).toLocaleDateString()}
                    </span>

                    <Link
                      href="/employer/applications"
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Applications Pipeline
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

export default function EmployerBookmarksPage() {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]}>
      <EmployerBookmarksContent />
    </ProtectedRoute>
  );
}
