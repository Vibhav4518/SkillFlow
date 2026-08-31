"use client";

import { useEffect, useState, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { candidateApi } from "@/services/candidate.api";
import { useToast } from "@/context/ToastContext";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Check,
  Zap,
  TrendingUp,
  FolderGit2,
} from "lucide-react";

function ResumeCenterContent() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"MANAGE" | "BUILDER">("BUILDER");

  // Resume builder data
  const [builderData, setBuilderData] = useState<any>({
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    skills: [],
    experiences: [],
    educations: [],
    projects: [],
    certifications: [],
    languages: [],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await candidateApi.getProfile();
      if (res?.success && res?.data) {
        const raw = res.data;
        setProfile(raw);

        const skillsList = (raw.skills || []).map((s: any) =>
          typeof s === "string" ? s : (s.name || s.skill?.name || "")
        ).filter(Boolean);

        const bData = {
          name: raw.basicDetails?.fullName || raw.name || raw.user?.fullName || "",
          headline: raw.basicDetails?.headline || raw.headline || "",
          email: raw.basicDetails?.email || raw.email || raw.user?.email || "",
          phone: raw.basicDetails?.phone || raw.phone || "",
          location: raw.basicDetails?.location || raw.location || "",
          summary: raw.basicDetails?.summary || raw.summary || "",
          skills: skillsList,
          experiences: raw.experience || raw.experiences || [],
          educations: raw.education || raw.educations || [],
          projects: raw.projects || [],
          certifications: raw.certifications || [],
          languages: raw.languages || [],
        };
        setBuilderData(bData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate ATS Compatibility Score & Diagnostics
  const calculateAtsScore = () => {
    let score = 0;
    const suggestions: string[] = [];
    const checks: { label: string; passed: boolean; pts: number }[] = [];

    // 1. Basic Info (20 pts)
    const hasContactInfo = Boolean(builderData.name && builderData.email && builderData.phone && builderData.location);
    if (hasContactInfo) {
      score += 20;
      checks.push({ label: "Full Contact Information (Name, Email, Phone, Location)", passed: true, pts: 20 });
    } else {
      checks.push({ label: "Full Contact Information", passed: false, pts: 20 });
      suggestions.push("Fill out phone number, email, and location in your profile.");
    }

    // 2. Professional Headline & Summary (20 pts)
    const hasHeadline = Boolean(builderData.headline && builderData.headline.length > 5);
    const hasSummary = Boolean(builderData.summary && builderData.summary.length > 40);
    if (hasHeadline && hasSummary) {
      score += 20;
      checks.push({ label: "Headline & Comprehensive Summary (>40 chars)", passed: true, pts: 20 });
    } else if (hasHeadline || hasSummary) {
      score += 10;
      checks.push({ label: "Partial Summary / Headline", passed: false, pts: 20 });
      suggestions.push("Expand your professional summary to at least 50 words highlighting key impact.");
    } else {
      checks.push({ label: "Professional Summary & Designation", passed: false, pts: 20 });
      suggestions.push("Add a targeted professional headline and summary.");
    }

    // 3. Core Skills Keywords Density (25 pts)
    const skillCount = builderData.skills.length;
    if (skillCount >= 6) {
      score += 25;
      checks.push({ label: `Key Technical Skills (${skillCount} tags added)`, passed: true, pts: 25 });
    } else if (skillCount >= 3) {
      score += 15;
      checks.push({ label: `Key Technical Skills (${skillCount}/6 added)`, passed: false, pts: 25 });
      suggestions.push(`Add ${6 - skillCount} more skill tags to improve keyword matching for recruiter filters.`);
    } else {
      checks.push({ label: "Core Skills Keywords", passed: false, pts: 25 });
      suggestions.push("Add key technical and soft skill tags in Key Skills section.");
    }

    // 4. Work Experience (20 pts)
    const expCount = builderData.experiences.length;
    if (expCount >= 1) {
      score += 20;
      checks.push({ label: `Work Experience History (${expCount} records)`, passed: true, pts: 20 });
    } else {
      checks.push({ label: "Work / Internship Experience", passed: false, pts: 20 });
      suggestions.push("Add at least one work experience or internship entry.");
    }

    // 5. Education & Projects (15 pts)
    const eduCount = builderData.educations.length;
    const projCount = builderData.projects.length;
    if (eduCount >= 1 && projCount >= 1) {
      score += 15;
      checks.push({ label: "Education Degree & Technical Projects", passed: true, pts: 15 });
    } else if (eduCount >= 1 || projCount >= 1) {
      score += 10;
      checks.push({ label: "Education or Projects Recorded", passed: false, pts: 15 });
      suggestions.push("Add both your formal education degree and key technical projects.");
    } else {
      checks.push({ label: "Education & Projects", passed: false, pts: 15 });
      suggestions.push("Add education qualifications and project portfolio entries.");
    }

    return { score, checks, suggestions };
  };

  const atsAnalysis = calculateAtsScore();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    try {
      setUploading(true);
      const res = await candidateApi.uploadResume(file);
      if (res?.success) {
        toast.success("Resume uploaded successfully!");
        const updatedResume = res.resume || res.data || { url: URL.createObjectURL(file), originalName: file.name };
        setProfile((prev: any) => ({
          ...prev,
          resumeUrl: updatedResume.url || updatedResume.resumeUrl,
          resumeOriginalName: file.name,
        }));
      } else {
        toast.error(res?.message || "Failed to upload resume.");
      }
    } catch {
      toast.error("Error uploading resume file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to remove your uploaded resume?")) {
      const res = await candidateApi.deleteResume();
      if (res?.success) {
        toast.success("Resume removed successfully.");
        setProfile((prev: any) => ({ ...prev, resumeUrl: null, resumeOriginalName: null }));
      } else {
        toast.error(res?.message || "Failed to delete resume.");
      }
    }
  };

  const handlePrintPdf = () => {
    window.print();
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8 print:p-0 print:max-w-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <FileText className="h-7 w-7 text-indigo-500" /> Resume Center &amp; ATS Optimizer
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Build an ATS-friendly resume directly from your profile data and analyze your keyword readiness score
            </p>
          </div>

          <div className="flex gap-2 p-1 rounded-2xl border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}>
            <button
              onClick={() => setActiveTab("BUILDER")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "BUILDER" ? "bg-indigo-600 text-white shadow-sm" : ""
              }`}
              style={activeTab !== "BUILDER" ? { color: "var(--color-text-muted)" } : {}}
            >
              <Sparkles className="h-3.5 w-3.5" /> ATS Resume &amp; Score
            </button>
            <button
              onClick={() => setActiveTab("MANAGE")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "MANAGE" ? "bg-indigo-600 text-white shadow-sm" : ""
              }`}
              style={activeTab !== "MANAGE" ? { color: "var(--color-text-muted)" } : {}}
            >
              Uploaded Document
            </button>
          </div>
        </div>

        {/* Tab 1: ATS Resume Builder & Optimizer */}
        {activeTab === "BUILDER" && (
          <div className="space-y-8">
            {/* ATS Score Checker Dashboard */}
            <div className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6 print:hidden" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" /> Real-time ATS Compatibility Engine
                  </span>
                  <h2 className="text-xl font-bold mt-1" style={{ color: "var(--color-text)" }}>
                    ATS Resume Score: <span className={atsAnalysis.score >= 80 ? "text-emerald-400" : atsAnalysis.score >= 50 ? "text-amber-400" : "text-red-400"}>{atsAnalysis.score}%</span>
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrintPdf}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md transition"
                  >
                    <Printer className="h-4 w-4" /> Download / Print PDF
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    atsAnalysis.score >= 80 ? "bg-emerald-500" : atsAnalysis.score >= 50 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${atsAnalysis.score}%` }}
                />
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Checks */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400">Profile Completeness Breakdown</h4>
                  <div className="space-y-2">
                    {atsAnalysis.checks.map((chk, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs rounded-xl p-2.5 border border-slate-800 bg-slate-900/50">
                        <span className="flex items-center gap-2 text-slate-300">
                          {chk.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                          )}
                          {chk.label}
                        </span>
                        <span className={`font-bold ${chk.passed ? "text-emerald-400" : "text-slate-500"}`}>
                          {chk.passed ? `+${chk.pts} pts` : "0 pts"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400">Actionable ATS Suggestions</h4>
                  {atsAnalysis.suggestions.length === 0 ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 space-y-1">
                      <p className="font-bold flex items-center gap-1"><Check className="h-4 w-4" /> Outstanding ATS Optimization!</p>
                      <p className="text-[11px] text-emerald-400/80">Your profile contains all core sections and keyword structures required by recruiter screening algorithms.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {atsAnalysis.suggestions.map((sug, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs rounded-xl p-2.5 border border-amber-500/20 bg-amber-500/5 text-amber-300">
                          <TrendingUp className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Document Preview */}
            <div
              className="p-8 sm:p-12 rounded-3xl border shadow-2xl space-y-6 max-w-4xl mx-auto bg-white text-slate-900 print:shadow-none print:border-none print:p-0"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {/* Header */}
              <div className="border-b border-slate-300 pb-4 text-center space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-wide uppercase">{builderData.name || "Candidate Name"}</h1>
                <p className="text-sm italic font-semibold text-slate-700">{builderData.headline || "Professional Designation"}</p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 font-sans mt-2">
                  {builderData.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {builderData.email}</span>}
                  {builderData.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {builderData.phone}</span>}
                  {builderData.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {builderData.location}</span>}
                </div>
              </div>

              {/* Summary */}
              {builderData.summary && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 font-sans">Professional Summary</h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{builderData.summary}</p>
                </div>
              )}

              {/* Core Skills */}
              {builderData.skills.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 font-sans">Core Competencies</h3>
                  <div className="flex flex-wrap gap-1.5 font-sans">
                    {builderData.skills.map((s: string, i: number) => (
                      <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {builderData.experiences.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 font-sans">Work Experience</h3>
                  <div className="space-y-3 font-sans">
                    {builderData.experiences.map((exp: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold text-slate-900">{exp.designation || exp.title} — <span className="font-normal italic">{exp.companyName || exp.company}</span></h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ""} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}
                          </span>
                        </div>
                        {exp.description && <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>}
                        {exp.technologies && <p className="text-[11px] text-slate-500">Technologies: {exp.technologies}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Projects */}
              {builderData.projects.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 font-sans">Technical Projects</h3>
                  <div className="space-y-2.5 font-sans">
                    {builderData.projects.map((proj: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold text-slate-900">{proj.name}</h4>
                          {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 hover:underline">{proj.liveUrl}</a>}
                        </div>
                        {proj.description && <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>}
                        {proj.technologies && <p className="text-[11px] text-slate-500">Tech Stack: {proj.technologies}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {builderData.educations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 font-sans">Education &amp; Qualifications</h3>
                  <div className="space-y-2 font-sans">
                    {builderData.educations.map((edu: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-baseline text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy || "Computer Science"}</span>
                          <span className="text-slate-600"> — {edu.institution}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{edu.startYear} - {edu.endYear || "Present"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Uploaded File */}
        {activeTab === "MANAGE" && (
          <div className="space-y-6 print:hidden">
            <div className="rounded-3xl border p-8 shadow-sm space-y-6" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <FileText className="h-5 w-5 text-indigo-600" /> Uploaded Custom Resume PDF
              </h2>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />

              {profile?.resumeUrl ? (
                <div className="p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)" }}>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                        {profile.resumeOriginalName || "Uploaded Resume File"}
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active &amp; Attached to Job Applications
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                    >
                      {uploading ? "Uploading..." : "Replace"}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-10 rounded-2xl border-2 border-dashed text-center cursor-pointer hover:border-indigo-500 transition space-y-3"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Upload className="h-10 w-10 mx-auto text-indigo-500" />
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>Upload custom resume PDF</h4>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Supports PDF, DOC, DOCX files up to 5MB</p>
                  </div>
                  <button
                    type="button"
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-indigo-700 transition"
                  >
                    {uploading ? "Uploading File..." : "Select File"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateResumePage() {
  return (
    <ProtectedRoute allowedRoles={["CANDIDATE"]}>
      <ResumeCenterContent />
    </ProtectedRoute>
  );
}
