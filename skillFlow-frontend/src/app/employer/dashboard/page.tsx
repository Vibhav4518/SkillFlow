"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import { employerApi } from "@/services/employer.api";
import { companyApi } from "@/services/company.api";
import { jobApi } from "@/services/job.api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Briefcase, Users, CheckCircle, PlusCircle, Building2, Eye, Trash2,
  Edit2, ShieldCheck, FileCheck, Globe, MapPin, X, Save, FileText, CheckCircle2, AlertTriangle
} from "lucide-react";

function StatCard({ label, value, icon: Icon, iconColor, loading, sub }: any) {
  return (
    <div className="rounded-2xl border p-6 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>{label}</span>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      {loading ? (
        <div className="mt-3 h-9 w-20 rounded-lg animate-pulse" style={{ backgroundColor: "var(--color-bg-muted)" }} />
      ) : (
        <p className="text-3xl font-extrabold mt-3" style={{ color: "var(--color-text)" }}>{value}</p>
      )}
      {sub && <div className="mt-1">{sub}</div>}
    </div>
  );
}

function EmployerDashboardContent() {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal CRUD State for Company Profile
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    logoUrl: "",
    industry: "",
    websiteUrl: "",
    description: "",
    location: "",
    companySize: "",
    verificationDocumentsUrl: "",
  });

  // Employer Team Management State
  const [showEmployersModal, setShowEmployersModal] = useState(false);
  const [employersList, setEmployersList] = useState<any[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);
  const [addingEmployer, setAddingEmployer] = useState(false);
  const [newEmployerForm, setNewEmployerForm] = useState({
    fullName: "",
    email: "",
    designation: "",
    department: "",
    phone: "",
    password: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, jobsRes, profileRes] = await Promise.allSettled([
        employerApi.getDashboard(),
        jobApi.getEmployerJobs(),
        employerApi.getProfile(),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value?.success) {
        setStats(dashRes.value.data);
      }
      if (jobsRes.status === "fulfilled" && jobsRes.value?.success) {
        setJobs(jobsRes.value.data || []);
      }
      if (profileRes.status === "fulfilled" && profileRes.value?.success && profileRes.value?.data?.company) {
        const comp = profileRes.value.data.company;
        setCompany(comp);
        setCompanyForm({
          name: comp.name || "",
          logoUrl: comp.logoUrl || "",
          industry: comp.industry || "",
          websiteUrl: comp.websiteUrl || "",
          description: comp.description || "",
          location: comp.location || "",
          companySize: comp.companySize || "",
          verificationDocumentsUrl: comp.verificationDocumentsUrl || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyEmployers = async () => {
    try {
      setLoadingEmployers(true);
      const res = await companyApi.getCompanyEmployers();
      if (res?.success && Array.isArray(res.data)) {
        setEmployersList(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEmployers(false);
    }
  };

  const handleAddEmployer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddingEmployer(true);
      const res = await companyApi.addEmployer(newEmployerForm);
      if (res?.success) {
        toast.success(res.message || "Employer added successfully!");
        setNewEmployerForm({ fullName: "", email: "", designation: "", department: "", phone: "", password: "" });
        loadCompanyEmployers();
      } else {
        toast.error(res?.message || "Failed to add employer.");
      }
    } catch {
      toast.error("Error creating employer account.");
    } finally {
      setAddingEmployer(false);
    }
  };

  const handleToggleEmployerActive = async (profileId: string, currentActive: boolean) => {
    try {
      const res = await companyApi.toggleEmployerStatus(profileId, !currentActive);
      if (res?.success) {
        toast.success(`Employer status updated.`);
        setEmployersList((prev) => prev.map((emp) => emp.id === profileId ? { ...emp, isActive: !currentActive } : emp));
      } else {
        toast.error(res?.message || "Failed to update employer status.");
      }
    } catch {
      toast.error("Error updating employer status.");
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) {
      toast.error("Company profile not initialized.");
      return;
    }
    try {
      setSavingCompany(true);
      const res = await companyApi.updateCompany(company.id, companyForm);
      if (res?.success || res?.data) {
        toast.success("Company profile & verification documents updated successfully!");
        setShowCompanyModal(false);
        setCompany(res.data || { ...company, ...companyForm });
        loadData();
      } else {
        toast.error(res?.message || "Failed to update company profile.");
      }
    } catch {
      toast.error("Error updating company details.");
    } finally {
      setSavingCompany(false);
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await jobApi.deleteJob(jobId);
    if (res?.success) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success(`"${title}" deleted successfully.`);
    } else {
      toast.error(res?.message || "Failed to delete job.");
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-bg-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  const firstName = (user?.fullName || "Employer").split(" ")[0];
  const activeJobs = stats?.activeJobs ?? stats?.activeJobsCount ?? jobs.filter((j: any) => j.status === "PUBLISHED").length;
  const draftJobs = stats?.draftJobs ?? 0;
  const totalApplicants = stats?.totalApplications ?? stats?.totalApplicantsCount ?? 0;
  const appliedCount = stats?.appliedApplications ?? 0;
  const shortlistedCount = stats?.shortlistedApplications ?? stats?.shortlistedCount ?? 0;
  const interviewCount = stats?.interviewApplications ?? 0;
  const selectedCount = stats?.selectedApplications ?? 0;
  const rejectedCount = stats?.rejectedApplications ?? 0;

  const isCompanyApproved = company?.verificationStatus === "APPROVED" || company?.verificationStatus === "VERIFIED";

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Verification Status Banners */}
        {company && (company.verificationStatus === "PENDING" || !company.verificationStatus) && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold block text-sm">Company Verification Pending</span>
                Our admin team is reviewing your company details. Employer management and job posting will become available after approval.
              </div>
            </div>
            <button onClick={() => setShowCompanyModal(true)} className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 shrink-0">
              Submit Details
            </button>
          </div>
        )}

        {company && company.verificationStatus === "REJECTED" && (
          <div className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-4 text-red-900 dark:text-red-200 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <span className="font-bold block text-sm">Company Verification Rejected</span>
                Reason: {company.rejectionReason || "Verification documents/details provided did not meet criteria."} Please update your company profile or upload valid registration documents for re-review.
              </div>
            </div>
            <button onClick={() => setShowCompanyModal(true)} className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shrink-0">
              Update Profile
            </button>
          </div>
        )}

        {company && company.verificationStatus === "SUSPENDED" && (
          <div className="rounded-2xl border border-purple-300 bg-purple-50 dark:bg-purple-950/40 p-4 text-purple-900 dark:text-purple-200 text-xs flex items-center gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" />
            <div>
              <span className="font-bold block text-sm">Company Account Suspended</span>
              Your company account has been suspended by an administrator. Job posting is disabled.
            </div>
          </div>
        )}

        {/* 1. Header Banner */}
        <div className="rounded-3xl border p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "var(--color-primary)" }}>Employer Portal</span>
              {company?.name && <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>• {company.name}</span>}
            </div>
            {loading ? (
              <div className="h-8 w-56 rounded-lg animate-pulse" style={{ backgroundColor: "var(--color-bg-muted)" }} />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>
                Welcome back, {firstName}!
              </h1>
            )}
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Manage company profile, review candidate pipelines, and publish job openings.</p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <button
              onClick={() => setShowCompanyModal(true)}
              className="flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition hover:opacity-80 shadow-sm"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text)" }}
            >
              <Building2 className="h-4 w-4 text-indigo-600" /> Company Profile
            </button>

            <button
              onClick={() => {
                setShowEmployersModal(true);
                loadCompanyEmployers();
              }}
              className="flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition hover:opacity-80 shadow-sm"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text)" }}
            >
              <Users className="h-4 w-4 text-indigo-600" /> Manage Team
            </button>

            {isCompanyApproved ? (
              <Link href="/employer/jobs/create" className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition">
                <PlusCircle className="h-4 w-4" /> Post New Job
              </Link>
            ) : (
              <button
                onClick={() => toast.warning("Job posting is unavailable until your company is verified by an administrator.")}
                className="flex items-center gap-1.5 rounded-xl bg-gray-400 dark:bg-gray-700 cursor-not-allowed px-4 py-2.5 text-xs font-semibold text-white shadow-sm"
                title="Company verification required to post jobs"
              >
                <PlusCircle className="h-4 w-4" /> Post New Job
              </button>
            )}
          </div>
        </div>

        {/* 2. INTEGRATED INLINE COMPANY DETAILS & VERIFICATION CARD */}
        {company && (
          <div
            className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6"
            style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-4">
                {company.logoUrl ? (
                  <Image src={company.logoUrl} alt={company.name} width={56} height={56} className="h-14 w-14 rounded-2xl object-cover border" unoptimized />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-inner">
                    {(company.name || "C")[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{company.name}</h2>
                    <span className={`rounded-full px-3 py-0.5 text-[11px] font-extrabold uppercase flex items-center gap-1 ${
                      company.verificationStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" :
                      company.verificationStatus === "REJECTED" ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" :
                      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}>
                      {company.verificationStatus === "VERIFIED" && <CheckCircle2 className="h-3 w-3" />}
                      {company.verificationStatus === "REJECTED" && <AlertTriangle className="h-3 w-3" />}
                      Verification: {company.verificationStatus || "PENDING"}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {company.industry || "General Industry"} • {company.location || "Location Not Specified"} • {company.companySize || "1-50"} Employees
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCompanyModal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
              >
                <Edit2 className="h-3.5 w-3.5" /> Manage Company Details &amp; Verification
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl border space-y-1" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)" }}>
                <span className="block font-semibold uppercase text-[10px] text-gray-500">Website</span>
                {company.websiteUrl ? (
                  <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline flex items-center gap-1 truncate">
                    <Globe className="h-3.5 w-3.5 shrink-0" /> {company.websiteUrl}
                  </a>
                ) : (
                  <span className="text-gray-400">Not specified</span>
                )}
              </div>

              <div className="p-4 rounded-2xl border space-y-1" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)" }}>
                <span className="block font-semibold uppercase text-[10px] text-gray-500">Verification Credentials</span>
                {company.verificationDocumentsUrl ? (
                  <a href={company.verificationDocumentsUrl} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 hover:underline flex items-center gap-1 truncate">
                    <FileCheck className="h-3.5 w-3.5 shrink-0" /> View Uploaded Credentials
                  </a>
                ) : (
                  <span className="text-amber-600 font-semibold">No credentials submitted yet</span>
                )}
              </div>

              <div className="p-4 rounded-2xl border space-y-1" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)" }}>
                <span className="block font-semibold uppercase text-[10px] text-gray-500">Company Overview</span>
                <p className="line-clamp-2 text-xs" style={{ color: "var(--color-text)" }}>
                  {company.description || "No company description provided."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Stats Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Active Postings" value={activeJobs} icon={Briefcase} iconColor="text-indigo-600" loading={loading}
            sub={<Link href="/employer/jobs" className="text-xs font-semibold text-indigo-600 hover:underline">Manage positions →</Link>}
          />
          <StatCard label="Total Applicants" value={totalApplicants} icon={Users} iconColor="text-blue-600" loading={loading}
            sub={<Link href="/employer/applications" className="text-xs font-semibold text-blue-600 hover:underline">Review pipeline →</Link>}
          />
          <StatCard label="Hired / Selected" value={selectedCount} icon={CheckCircle} iconColor="text-emerald-600" loading={loading}
            sub={<span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{rejectedCount} rejected · {draftJobs} draft jobs</span>}
          />
        </div>

        {/* 4. Application Pipeline Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Applied", value: appliedCount, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Shortlisted", value: shortlistedCount, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
            { label: "Interview", value: interviewCount, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
            { label: "Selected", value: selectedCount, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl p-4 ${bg}`}>
              <p className={`text-xs font-semibold ${color}`}>{label}</p>
              {loading ? (
                <div className="mt-1.5 h-6 w-10 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
              ) : (
                <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value ?? 0}</p>
              )}
            </div>
          ))}
        </div>

        {/* 5. Jobs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Your Posted Jobs</h2>
            <Link href="/employer/jobs" className="text-xs font-semibold text-indigo-600 hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border p-5 animate-pulse" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                  <div className="h-4 w-40 rounded" style={{ backgroundColor: "var(--color-bg-muted)" }} />
                  <div className="h-3 w-28 rounded mt-2" style={{ backgroundColor: "var(--color-bg-muted)" }} />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-3xl border p-12 text-center" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <Briefcase className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-text-subtle)" }} />
              <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>No job postings yet</h3>
              <p className="text-xs mt-1 mb-4" style={{ color: "var(--color-text-muted)" }}>Create your first job listing to start receiving candidates.</p>
              <Link href="/employer/jobs/create" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition">
                Post a Job Opening
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-2xl border p-5 shadow-sm flex flex-col justify-between" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        job.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" :
                        job.status === "DRAFT" ? "bg-amber-50 text-amber-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{job.status}</span>
                      <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>{job.workType}</span>
                    </div>
                    <h3 className="text-base font-bold" style={{ color: "var(--color-text)" }}>{job.title}</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{job.location || "Remote"}</p>
                  </div>
                  <div className="mt-4 border-t pt-3 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                    <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                      {job._count?.applications ?? job.applications?.length ?? 0} applicants
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/employer/applications"
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. MODAL FOR INLINE COMPANY PROFILE CRUD & VERIFICATION SUBMISSION */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border p-6 sm:p-8 shadow-2xl space-y-6 my-8" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <Building2 className="h-5 w-5 text-indigo-600" /> Edit Company Profile &amp; Credentials
                </h3>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Update organization details and submit credentials for admin verification.
                </p>
              </div>
              <button onClick={() => setShowCompanyModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Industry / Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Information Technology, Healthcare"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Website URL</label>
                  <input
                    type="text"
                    placeholder="https://company.com"
                    value={companyForm.websiteUrl}
                    onChange={(e) => setCompanyForm({ ...companyForm, websiteUrl: e.target.value })}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Company Logo URL</label>
                  <input
                    type="text"
                    placeholder="https://company.com/logo.png"
                    value={companyForm.logoUrl}
                    onChange={(e) => setCompanyForm({ ...companyForm, logoUrl: e.target.value })}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Location / HQ</label>
                  <input
                    type="text"
                    placeholder="e.g. New York, NY"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Company Size</label>
                  <select
                    value={companyForm.companySize}
                    onChange={(e) => setCompanyForm({ ...companyForm, companySize: e.target.value })}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none"
                    style={inputStyle}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-500">201-500 Employees</option>
                    <option value="500+">500+ Employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>
                  Verification Credentials / Document URL (PDF/Link)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/docs/company-registration.pdf"
                  value={companyForm.verificationDocumentsUrl}
                  onChange={(e) => setCompanyForm({ ...companyForm, verificationDocumentsUrl: e.target.value })}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none"
                  style={inputStyle}
                />
                <p className="text-[10px] mt-1 text-gray-500">
                  Submitting credentials will automatically trigger an admin verification notification.
                </p>
              </div>

              <div>
                <label className="block font-semibold uppercase text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>Company Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your organization's mission, values, and culture..."
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none resize-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCompany}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <Save className="h-4 w-4" />
                  {savingCompany ? "Saving..." : "Save Details & Submit Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL FOR EMPLOYER / RECRUITER TEAM MANAGEMENT */}
      {showEmployersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border p-6 sm:p-8 shadow-2xl space-y-6 my-8" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <Users className="h-5 w-5 text-indigo-600" /> Manage Team &amp; Employers — {company?.name || "Company"}
                </h3>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Add recruiters to your company workspace, manage designations, and activate or deactivate access.
                </p>
              </div>
              <button onClick={() => setShowEmployersModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Form: Add Employer */}
            <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)" }}>
              <h4 className="font-bold text-xs" style={{ color: "var(--color-text)" }}>+ Add / Invite New Employer</h4>
              <form onSubmit={handleAddEmployer} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={newEmployerForm.fullName}
                    onChange={(e) => setNewEmployerForm({ ...newEmployerForm, fullName: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Work Email *"
                    value={newEmployerForm.email}
                    onChange={(e) => setNewEmployerForm({ ...newEmployerForm, email: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Designation (e.g. HR Lead)"
                    value={newEmployerForm.designation}
                    onChange={(e) => setNewEmployerForm({ ...newEmployerForm, designation: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Department (e.g. Talent)"
                    value={newEmployerForm.department}
                    onChange={(e) => setNewEmployerForm({ ...newEmployerForm, department: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Initial Password (optional)"
                    value={newEmployerForm.password}
                    onChange={(e) => setNewEmployerForm({ ...newEmployerForm, password: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div className="flex items-center">
                  <button
                    type="submit"
                    disabled={addingEmployer || !isCompanyApproved}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {addingEmployer ? "Adding..." : "Add Employer"}
                  </button>
                </div>
              </form>
              {!isCompanyApproved && (
                <p className="text-[11px] text-amber-600 font-semibold">
                  ⚠️ Company verification is required before adding team members.
                </p>
              )}
            </div>

            {/* List: Existing Employers */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs" style={{ color: "var(--color-text)" }}>Existing Team Members ({employersList.length})</h4>

              {loadingEmployers ? (
                <div className="py-6 text-center text-xs text-gray-500">Loading team members...</div>
              ) : employersList.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">No additional team members added yet.</div>
              ) : (
                <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
                  <table className="w-full text-left text-xs">
                    <thead className="border-b font-semibold uppercase text-[10px]" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }}>
                      <tr>
                        <th className="px-4 py-3">Name &amp; Email</th>
                        <th className="px-4 py-3">Role / Designation</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employersList.map((emp) => (
                        <tr key={emp.id} className="border-b" style={{ borderColor: "var(--color-border)" }}>
                          <td className="px-4 py-3">
                            <p className="font-bold" style={{ color: "var(--color-text)" }}>{emp.user?.fullName || "Employer"}</p>
                            <p className="text-gray-500 text-[11px]">{emp.user?.email}</p>
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>
                            <p className="font-semibold">{emp.designation || "Recruiter"}</p>
                            <p className="text-[11px]">{emp.department || "HR"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${emp.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"}`}>
                              {emp.isActive !== false ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleToggleEmployerActive(emp.id, emp.isActive !== false)}
                              className={`rounded-lg px-2.5 py-1 font-bold text-[11px] ${emp.isActive !== false ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                            >
                              {emp.isActive !== false ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowEmployersModal(false)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]}>
      <EmployerDashboardContent />
    </ProtectedRoute>
  );
}
