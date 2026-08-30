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
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function ResumeCenterContent() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"MANAGE" | "BUILDER">("MANAGE");

  // Resume builder editable fields
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
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await candidateApi.getProfile();
      if (res?.success && res?.data) {
        setProfile(res.data);
        const bData = {
          name: res.data.basicDetails?.fullName || res.data.name || "",
          headline: res.data.basicDetails?.headline || res.data.headline || "",
          email: res.data.basicDetails?.email || res.data.email || "",
          phone: res.data.basicDetails?.phone || res.data.phone || "",
          location: res.data.basicDetails?.location || res.data.location || "",
          summary: res.data.basicDetails?.summary || res.data.summary || "",
          skills: (res.data.skills || []).map((s: any) => (typeof s === "string" ? s : s.name)),
          experiences: res.data.experience || res.data.experiences || [],
          educations: res.data.education || res.data.educations || [],
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
        // Update local profile state immediately
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

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8 print:p-0 print:max-w-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>Resume Center</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Upload an existing resume or build an ATS-friendly document with your SkillFlow profile</p>
          </div>

          <div className="flex gap-2 p-1 rounded-2xl border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}>
            <button
              onClick={() => setActiveTab("MANAGE")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "MANAGE" ? "bg-indigo-600 text-white" : ""}`}
              style={activeTab !== "MANAGE" ? { color: "var(--color-text-muted)" } : {}}
            >
              Resume File
            </button>
            <button
              onClick={() => setActiveTab("BUILDER")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "BUILDER" ? "bg-indigo-600 text-white" : ""}`}
              style={activeTab !== "BUILDER" ? { color: "var(--color-text-muted)" } : {}}
            >
              <Sparkles className="h-3.5 w-3.5" /> ATS Resume Builder
            </button>
          </div>
        </div>

        {/* Tab 1: Upload & Manage Existing Resume */}
        {activeTab === "MANAGE" && (
          <div className="space-y-6 print:hidden">
            <div className="rounded-3xl border p-8 shadow-sm space-y-6" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <FileText className="h-5 w-5 text-indigo-600" /> Uploaded Resume File
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
                        {profile.resumeOriginalName || "Resume Document"}
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active &amp; Ready for Job Applications
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
                      <Download className="h-3.5 w-3.5" /> View / Download
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
                    <h4 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>Upload your resume</h4>
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

        {/* Tab 2: SkillFlow ATS Resume Builder */}
        {activeTab === "BUILDER" && (
          <div className="space-y-8">
            {/* Control Bar */}
            <div className="flex justify-between items-center print:hidden">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>ATS Resume Live Preview</h2>
              <button
                onClick={handlePrintPdf}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
              >
                <Printer className="h-4 w-4" /> Print / Save as PDF
              </button>
            </div>

            {/* ATS Resume Document Preview */}
            <div
              className="p-8 sm:p-12 rounded-3xl border shadow-xl space-y-6 max-w-4xl mx-auto bg-white text-slate-900 print:shadow-none print:border-none print:p-0"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {/* Header */}
              <div className="border-b border-slate-300 pb-4 text-center space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-wide uppercase">{builderData.name || "Candidate Name"}</h1>
                <p className="text-sm italic font-semibold text-slate-700">{builderData.headline || "Professional Role"}</p>
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

              {/* Skills */}
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
                          <span className="text-[10px] text-slate-500 font-mono">{new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}</span>
                        </div>
                        {exp.description && <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {builderData.educations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 font-sans">Education</h3>
                  <div className="space-y-2 font-sans">
                    {builderData.educations.map((edu: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-baseline text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy || "General Studies"}</span>
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
