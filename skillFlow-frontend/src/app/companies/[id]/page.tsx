"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { companyApi } from "@/services/company.api";
import { jobApi } from "@/services/job.api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  ShieldCheck,
  Briefcase,
  Star,
  ArrowLeft,
} from "lucide-react";

export default function PublicCompanyProfilePage() {
  const params = useParams();
  const companyId = params?.id as string;
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();

  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reviews
  const [reviewsData, setReviewsData] = useState<{ averageRating: number; totalReviews: number; reviews: any[] }>({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  });
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadCompanyData = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const [compRes, jobsRes, revRes] = await Promise.all([
        companyApi.getCompany(companyId),
        jobApi.getJobs({ limit: 50 }),
        companyApi.getReviews(companyId),
      ]);

      if (compRes?.success && compRes?.data) {
        setCompany(compRes.data);
      }
      if (jobsRes?.success && jobsRes?.data) {
        const allJobs = Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data.jobs || [];
        setJobs(allJobs.filter((j: any) => j.companyId === companyId || j.company?.id === companyId));
      }
      if (revRes?.success && revRes?.data) {
        setReviewsData(revRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) {
      toast.error("Please write a review.");
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await companyApi.addReview(companyId, {
        rating: newRating,
        title: newReviewTitle,
        review: newReviewText,
      });
      if (res?.success) {
        toast.success("Review submitted successfully!");
        setNewReviewTitle("");
        setNewReviewText("");
        const revRes = await companyApi.getReviews(companyId);
        if (revRes?.success && revRes?.data) setReviewsData(revRes.data);
      } else {
        toast.error(res?.message || "Failed to submit review.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-bg-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Building2 className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Company profile not found</h2>
        <Link href="/jobs" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Explore Jobs
        </Link>
      </div>
    );
  }

  const isCandidate = user?.role === "CANDIDATE";

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to job search
        </Link>

        {/* Company Header Card */}
        <div className="rounded-3xl border p-8 sm:p-10 shadow-sm relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="h-20 w-20 rounded-2xl border flex items-center justify-center font-bold text-2xl shrink-0 overflow-hidden" style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)" }}>
              {company.logoUrl ? (
                <Image src={company.logoUrl} alt={company.name} width={80} height={80} className="object-cover h-full w-full" unoptimized />
              ) : (
                <Building2 className="h-10 w-10 text-indigo-600" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>{company.name}</h1>
                {company.verificationStatus === "VERIFIED" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Enterprise
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
                {company.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-indigo-500" /> {company.location}
                  </span>
                )}
                {company.companySize && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-indigo-500" /> {company.companySize} employees
                  </span>
                )}
                {company.websiteUrl && (
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Globe className="h-4 w-4" />
                    <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline">
                      {company.websiteUrl}
                    </a>
                  </span>
                )}
                {reviewsData.totalReviews > 0 && (
                  <span className="flex items-center gap-1 font-bold" style={{ color: "var(--color-text)" }}>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {reviewsData.averageRating} ({reviewsData.totalReviews} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Overview & Active Jobs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="rounded-3xl border p-8 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>About {company.name}</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {company.description || "No overview provided for this company."}
              </p>
            </div>

            {/* Active Jobs */}
            <div className="rounded-3xl border p-8 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <Briefcase className="h-5 w-5 text-indigo-600" /> Active Job Openings ({jobs.length})
              </h2>

              {jobs.length === 0 ? (
                <p className="text-xs italic py-4" style={{ color: "var(--color-text-muted)" }}>No active openings at this moment.</p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((j) => (
                    <div key={j.id} className="p-4 rounded-2xl border flex items-center justify-between gap-4" style={{ borderColor: "var(--color-border)" }}>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>{j.title}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{j.location || "Remote"} • {j.workType || "Full-time"}</p>
                      </div>
                      <Link href={`/jobs/${j.id}`} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition">
                        View & Apply
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Reviews */}
          <div className="space-y-6">
            <div className="rounded-3xl border p-6 shadow-sm space-y-6" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>Reviews</h3>
                {reviewsData.totalReviews > 0 && (
                  <span className="text-xs font-bold text-amber-500">★ {reviewsData.averageRating}</span>
                )}
              </div>

              {isCandidate && (
                <form onSubmit={handleAddReview} className="p-4 rounded-2xl border space-y-3" style={{ borderColor: "var(--color-border)" }}>
                  <h4 className="text-xs font-bold uppercase" style={{ color: "var(--color-text-muted)" }}>Write a Review</h4>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setNewRating(star)} className="p-1">
                        <Star className={`h-4 w-4 ${star <= newRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Title"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    className="w-full rounded-xl border px-3 py-1.5 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                  <textarea
                    rows={2}
                    placeholder="Your review..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full rounded-xl border px-3 py-1.5 text-xs focus:outline-none resize-none"
                    style={inputStyle}
                    required
                  />
                  <button type="submit" disabled={submittingReview} className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700">
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {reviewsData.reviews.length === 0 ? (
                  <p className="text-xs italic py-2 text-center" style={{ color: "var(--color-text-muted)" }}>No reviews yet.</p>
                ) : (
                  reviewsData.reviews.map((r: any) => (
                    <div key={r.id} className="p-3 rounded-2xl border space-y-1 text-xs" style={{ borderColor: "var(--color-border)" }}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-500">★ {r.rating} {r.title}</span>
                        <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ color: "var(--color-text-muted)" }}>{r.review}</p>
                      <p className="text-[10px]" style={{ color: "var(--color-text-subtle)" }}>- {r.userName}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
