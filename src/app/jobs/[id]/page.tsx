"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { jobApi } from "@/services/job.api";
import { applicationApi } from "@/services/application.api";
import { companyApi } from "@/services/company.api";
import { candidateApi } from "@/services/candidate.api";
import { bookmarkApi } from "@/services/bookmark.api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  MapPin,
  Briefcase,
  Building2,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Globe,
  Star,
  FileText,
  Bookmark,
  ShieldCheck,
  Building,
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();

  const jobId = (params?.id || params?.jobId) as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [appliedApp, setAppliedApp] = useState<any>(null);

  // Resume selection & candidate profile
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [resumeType, setResumeType] = useState<"UPLOADED" | "GENERATED">("UPLOADED");

  // Company Reviews
  const [reviewsData, setReviewsData] = useState<{ averageRating: number; totalReviews: number; reviews: any[] }>({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  });
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  const fetchJobData = useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const res = await jobApi.getJobById(jobId);
      if (res.success && res.data) {
        setJob(res.data);
        if (res.data.companyId || res.data.company?.id) {
          fetchCompanyReviews(res.data.companyId || res.data.company?.id);
        }
      } else {
        setError(res.message || "Job not found");
      }
    } catch {
      setError("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const checkUserStatus = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    if (jobId) {
      bookmarkApi.checkBookmark({ jobId }).then((res) => {
        if (res?.success && res?.data?.bookmarked) {
          setSaved(true);
        }
      }).catch(() => {});
    }
    if (user.role === "CANDIDATE") {
      try {
        const [appRes, profRes] = await Promise.all([
          candidateApi.getApplications(),
          candidateApi.getProfile(),
        ]);
        if (appRes?.success && Array.isArray(appRes?.data)) {
          const found = appRes.data.find((a: any) => a.jobId === jobId);
          if (found) setAppliedApp(found);
        }
        if (profRes?.success && profRes?.data) {
          setCandidateProfile(profRes.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isAuthenticated, user, jobId]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark jobs");
      return;
    }
    try {
      const res = await bookmarkApi.toggleBookmark({ jobId, type: "JOB" });
      if (res?.success) {
        setSaved(res.bookmarked);
        toast.success(res.message || (res.bookmarked ? "Job saved to bookmarks" : "Job unsaved"));
      } else {
        toast.error("Failed to update bookmark.");
      }
    } catch {
      toast.error("Error updating bookmark.");
    }
  };

  const fetchCompanyReviews = async (companyId: string) => {
    try {
      const res = await companyApi.getReviews(companyId);
      if (res?.success && res?.data) {
        setReviewsData(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJobData();
    checkUserStatus();
  }, [fetchJobData, checkUserStatus]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      setApplying(true);
      const res = await applicationApi.applyToJob({
        jobId,
        coverLetter,
      });

      if (res.success) {
        toast.success("Application submitted successfully!");
        setApplyModalOpen(false);
        setAppliedApp(res.data || { status: "APPLIED" });
      } else {
        toast.error(res.message || "Could not submit application.");
      }
    } catch {
      toast.error("Network error occurred during application submission.");
    } finally {
      setApplying(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) {
      toast.error("Please write a review.");
      return;
    }
    const companyId = job?.companyId || job?.company?.id;
    if (!companyId) return;

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
        fetchCompanyReviews(companyId);
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

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{error || "Job opening not found"}</h2>
        <Link href="/jobs" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Return to jobs
        </Link>
      </div>
    );
  }

  const company = job.company || {};
  const isCandidate = user?.role === "CANDIDATE";
  const isEmployerOrAdmin = user?.role === "EMPLOYER" || user?.role === "ADMIN";

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

        {/* Job Header Card */}
        <div
          className="rounded-3xl border p-8 sm:p-10 shadow-sm relative overflow-hidden"
          style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-5 items-start">
              <div
                className="h-16 w-16 rounded-2xl border flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden"
                style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)" }}
              >
                {company.logoUrl ? (
                  <Image src={company.logoUrl} alt={company.name} width={64} height={64} className="object-cover h-full w-full" unoptimized />
                ) : (
                  <Building2 className="h-8 w-8 text-indigo-600" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-3 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    {job.workType || "Full-time"}
                  </span>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {job.jobType || "Permanent"}
                  </span>
                  {company.verificationStatus === "VERIFIED" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> Verified Company
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>
                  {job.title}
                </h1>

                <p className="text-sm font-semibold mt-1 text-indigo-600 dark:text-indigo-400">
                  <Link href={`/companies/${company.id}`} className="hover:underline">
                    {company.name || "SkillFlow Verified Partner"}
                  </Link>
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    {job.location || "Remote"}
                  </span>
                  {job.salaryMin && job.isSalaryVisible !== false && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L / yr
                    </span>
                  )}
                  {job.experienceMin !== undefined && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                      Exp: {job.experienceMin} - {job.experienceMax || "+"} yrs
                    </span>
                  )}
                  {job.vacancies && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-indigo-500" />
                      {job.vacancies} vacancies
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleToggleBookmark}
                className="p-3 rounded-2xl border transition hover:opacity-80"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)", color: saved ? "rgb(234, 179, 8)" : "var(--color-text-muted)" }}
                aria-label="Save job"
              >
                <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
              </button>

              {appliedApp ? (
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-6 py-3 text-center">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">Status: {appliedApp.status}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-500">Applied on {new Date(appliedApp.appliedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              ) : isEmployerOrAdmin ? (
                <div className="rounded-2xl border px-5 py-2.5 text-xs font-semibold" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                  Employer / Admin View
                </div>
              ) : (
                <button
                  onClick={() => setApplyModalOpen(true)}
                  className="rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition"
                >
                  Apply for this Position
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="rounded-3xl border p-8 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Job Description</h2>
              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--color-text-muted)" }}>
                {job.description}
              </div>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="rounded-3xl border p-8 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Required Skills & Competencies</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-xl px-3.5 py-1.5 text-xs font-semibold border"
                      style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    >
                      {s.skill?.name || s.name || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Reviews Section */}
            <div className="rounded-3xl border p-8 shadow-sm space-y-6" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Company Reviews</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    Verified candidate feedback for {company.name || "this company"}
                  </p>
                </div>
                {reviewsData.totalReviews > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-xl font-extrabold" style={{ color: "var(--color-text)" }}>{reviewsData.averageRating}</span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>({reviewsData.totalReviews} reviews)</span>
                  </div>
                )}
              </div>

              {/* Review Form for Candidate */}
              {isCandidate && (
                <form onSubmit={handleAddReview} className="p-4 rounded-2xl border space-y-3" style={{ borderColor: "var(--color-border)" }}>
                  <h4 className="text-xs font-bold uppercase" style={{ color: "var(--color-text-muted)" }}>Leave a Review</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1"
                        >
                          <Star className={`h-5 w-5 ${star <= newRating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Review Title (e.g. Great work culture)"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                  <textarea
                    rows={3}
                    placeholder="Share your experience working with this employer..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none resize-none"
                    style={inputStyle}
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsData.reviews.length === 0 ? (
                  <p className="text-xs italic py-4 text-center" style={{ color: "var(--color-text-muted)" }}>No reviews yet.</p>
                ) : (
                  reviewsData.reviews.map((r: any) => (
                    <div key={r.id} className="p-4 rounded-2xl border space-y-2" style={{ borderColor: "var(--color-border)" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <Star key={st} className={`h-3.5 w-3.5 ${st <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                          {r.title && <span className="text-xs font-bold" style={{ color: "var(--color-text)" }}>{r.title}</span>}
                        </div>
                        <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{r.review}</p>
                      <p className="text-[10px] font-semibold" style={{ color: "var(--color-text-subtle)" }}>By {r.userName || "Verified Candidate"}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Employer Info Card */}
            <div className="rounded-3xl border p-6 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>About the Employer</h3>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl border flex items-center justify-center font-bold text-lg overflow-hidden shrink-0" style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)" }}>
                  {company.logoUrl ? (
                    <Image src={company.logoUrl} alt={company.name} width={48} height={48} className="object-cover h-full w-full" unoptimized />
                  ) : (
                    <Building className="h-6 w-6 text-indigo-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{company.name || "SkillFlow Partner"}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{company.location || "Location not specified"}</p>
                </div>
              </div>

              {company.companySize && (
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <Users className="h-4 w-4 text-indigo-500" />
                  Company Size: {company.companySize} employees
                </div>
              )}

              {company.websiteUrl && (
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <Globe className="h-4 w-4 shrink-0" />
                  <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                    {company.websiteUrl}
                  </a>
                </div>
              )}

              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {company.description || "An enterprise organization hiring talent on SkillFlow."}
              </p>

              <div className="pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                <Link
                  href={`/companies/${company.id}`}
                  className="block w-full text-center rounded-xl border py-2.5 text-xs font-semibold transition hover:opacity-80"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text)" }}
                >
                  View Company Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="font-bold text-lg" style={{ color: "var(--color-text)" }}>Apply to {job.title}</h3>
              <button onClick={() => setApplyModalOpen(false)} className="text-xs font-bold px-2 py-1 rounded-lg" style={{ color: "var(--color-text-muted)" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              {/* Resume Selection */}
              <div className="p-4 rounded-2xl border space-y-2" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)" }}>
                <h4 className="text-xs font-bold uppercase" style={{ color: "var(--color-text-muted)" }}>Resume to Submit</h4>
                {candidateProfile?.resumeUrl ? (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--color-text)" }}>
                      <input
                        type="radio"
                        name="resumeChoice"
                        value="UPLOADED"
                        checked={resumeType === "UPLOADED"}
                        onChange={() => setResumeType("UPLOADED")}
                      />
                      <FileText className="h-4 w-4 text-indigo-600" />
                      Uploaded Resume ({candidateProfile.resumeOriginalName || "PDF Document"})
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--color-text)" }}>
                      <input
                        type="radio"
                        name="resumeChoice"
                        value="GENERATED"
                        checked={resumeType === "GENERATED"}
                        onChange={() => setResumeType("GENERATED")}
                      />
                      <FileText className="h-4 w-4 text-emerald-600" />
                      Generated SkillFlow Resume (from Candidate Profile)
                    </label>
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    No uploaded resume found. Your verified SkillFlow Profile will be submitted automatically.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                  Cover Letter (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why your experience matches this position..."
                  className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none resize-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="rounded-xl border px-4 py-2 text-xs font-semibold"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
