"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { candidateApi } from "@/services/candidate.api";
import { applicationApi } from "@/services/application.api";
import { jobApi } from "@/services/job.api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  User,
  Globe2,
  Save,
  GraduationCap,
  Briefcase,
  Code2,
  FileText,
  Plus,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Sparkles,
  Award,
  Languages as LanguagesIcon,
  FolderGit2,
  Clock,
  TrendingUp,
  X,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";

// Calculate completeness matching Naukri ring
function calculateProfileCompleteness(profile: any): number {
  if (!profile) return 10;
  const basic = profile.basicDetails || profile;
  let score = 10;
  if (basic.fullName) score += 10;
  if (basic.headline) score += 10;
  if (basic.summary) score += 10;
  if (basic.phone) score += 10;
  if (basic.location) score += 10;
  if (basic.profilePhotoUrl) score += 10;
  if (profile.resume?.url || profile.resumeUrl) score += 10;
  if (profile.skills?.length > 0) score += 10;
  if (profile.education?.length > 0 || profile.educations?.length > 0) score += 10;
  if (profile.experience?.length > 0 || profile.experiences?.length > 0) score += 10;
  return Math.min(score, 100);
}

const STATUS_STYLES: Record<string, string> = {
  SELECTED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
  INTERVIEW: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30",
  SHORTLISTED: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
};

export default function CandidateProfileContent() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Active tab: 'profile' (View & Edit) | 'activity' (Applications & Dashboard) | 'resume' (Resume Center)
  const initialTab = (searchParams?.get("tab") as any) || "profile";
  const [activeTab, setActiveTab] = useState<"profile" | "activity" | "resume">(
    ["profile", "activity", "resume"].includes(initialTab) ? initialTab : "profile"
  );

  const [loading, setLoading] = useState(true);
  const [savingBasic, setSavingBasic] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Complete profile data state
  const [profileData, setProfileData] = useState<any>({
    basicDetails: {},
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    languages: [],
    resume: {},
  });

  // Dashboard activity state
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);

  // Section modals / toggle states
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showProjForm, setShowProjForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [showLangForm, setShowLangForm] = useState(false);

  // Form states
  const [basicForm, setBasicForm] = useState<any>({
    fullName: "",
    headline: "",
    phone: "",
    location: "",
    summary: "",
    preferredWorkType: "HYBRID",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  const [newEdu, setNewEdu] = useState({ institution: "", degree: "", fieldOfStudy: "", startYear: 2020, endYear: 2024, grade: "" });
  const [newExp, setNewExp] = useState({ company: "", title: "", startDate: "", endDate: "", isCurrent: false, description: "" });
  const [newProj, setNewProj] = useState({ name: "", description: "", technologies: "", githubUrl: "", liveUrl: "" });
  const [newCert, setNewCert] = useState({ name: "", issuingOrganization: "", issueDate: "", credentialUrl: "" });
  const [newLang, setNewLang] = useState({ language: "", canRead: true, canWrite: true, canSpeak: true });
  const [newSkillInput, setNewSkillInput] = useState("");

  const handleAddSkill = async (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (profileData.skills.some((s: any) => (s.name || s).toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already in your key skills list.`);
      setNewSkillInput("");
      return;
    }
    const updatedSkills = [...profileData.skills.map((s: any) => s.name || s), trimmed];
    setProfileData((prev: any) => ({ ...prev, skills: updatedSkills }));
    setNewSkillInput("");

    try {
      const res = await candidateApi.updateProfile({ skills: updatedSkills });
      if (res?.success) {
        toast.success(`Skill "${trimmed}" added!`);
        loadAllData(true);
      } else {
        await candidateApi.addSkill(trimmed);
        toast.success(`Skill "${trimmed}" added!`);
        loadAllData(true);
      }
    } catch {
      toast.error("Failed to add skill tag.");
      loadAllData(true);
    }
  };

  const handleRemoveSkill = async (skillId: string, skillName: string) => {
    const updatedSkills = profileData.skills
      .filter((s: any) => (s.id ? s.id !== skillId : s !== skillName && s.name !== skillName))
      .map((s: any) => s.name || s);

    setProfileData((prev: any) => ({ ...prev, skills: updatedSkills }));

    try {
      const res = await candidateApi.updateProfile({ skills: updatedSkills });
      if (res?.success) {
        toast.success("Skill tag removed.");
        loadAllData(true);
      } else if (skillId) {
        await candidateApi.deleteSkill(skillId);
        toast.success("Skill tag removed.");
        loadAllData(true);
      }
    } catch {
      toast.error("Failed to remove skill tag.");
      loadAllData(true);
    }
  };

  const loadAllData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [profRes, appRes, jobsRes] = await Promise.allSettled([
        candidateApi.getProfile(),
        applicationApi.getCandidateApplications(),
        jobApi.getJobs({ limit: 4 }),
      ]);

      if (profRes.status === "fulfilled" && profRes.value?.success && profRes.value?.data) {
        const d = profRes.value.data;
        const basic = d.basicDetails || d;
        setProfileData({
          basicDetails: basic,
          skills: d.skills || [],
          education: d.education || d.educations || [],
          experience: d.experience || d.experiences || [],
          projects: d.projects || [],
          certifications: d.certifications || [],
          languages: d.languages || [],
          resume: d.resume || {},
        });
        setBasicForm({
          fullName: basic.fullName || user?.fullName || "",
          headline: basic.headline || "",
          phone: basic.phone || "",
          location: basic.location || "",
          summary: basic.summary || "",
          preferredWorkType: basic.preferredWorkType || "HYBRID",
          profilePhotoUrl: basic.profilePhotoUrl || "",
          resumeUrl: basic.resumeUrl || d.resume?.url || "",
          linkedinUrl: basic.linkedinUrl || "",
          githubUrl: basic.githubUrl || "",
          portfolioUrl: basic.portfolioUrl || "",
        });
      }

      if (appRes.status === "fulfilled" && appRes.value?.success) {
        setApplications(appRes.value.data || []);
      }

      if (jobsRes.status === "fulfilled" && jobsRes.value?.success) {
        const d = jobsRes.value.data;
        setRecommendedJobs(Array.isArray(d) ? d : d?.jobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingBasic(true);
      const res = await candidateApi.updateProfile(basicForm);
      if (res?.success) {
        toast.success("Profile basic details updated successfully!");
        setShowBasicModal(false);
        loadAllData();
      } else {
        toast.error(res?.message || "Failed to update profile.");
      }
    } catch {
      toast.error("Network error during update.");
    } finally {
      setSavingBasic(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const photoUrl = URL.createObjectURL(file);
      const res = await candidateApi.updateProfile({ profilePhotoUrl: photoUrl });
      if (res?.success) {
        toast.success("Profile photo updated!");
        loadAllData();
      } else {
        toast.error("Failed to update photo.");
      }
    } catch {
      toast.error("Error uploading photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdu.institution || !newEdu.degree) {
      toast.error("Institution and degree are required.");
      return;
    }
    const res = await candidateApi.addEducation({
      institution: newEdu.institution,
      degree: newEdu.degree,
      fieldOfStudy: newEdu.fieldOfStudy,
      startYear: Number(newEdu.startYear),
      endYear: Number(newEdu.endYear),
      grade: newEdu.grade,
    });
    if (res?.success) {
      toast.success("Education added!");
      setShowEduForm(false);
      setNewEdu({ institution: "", degree: "", fieldOfStudy: "", startYear: 2020, endYear: 2024, grade: "" });
      loadAllData();
    } else {
      toast.error(res?.message || "Failed to add education.");
    }
  };

  const handleDeleteEducation = async (id: string) => {
    const res = await candidateApi.deleteEducation(id);
    if (res?.success) {
      toast.success("Education record removed.");
      loadAllData();
    } else {
      toast.error(res?.message || "Failed to remove education.");
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.company || !newExp.title || !newExp.startDate) {
      toast.error("Company, title, and start date are required.");
      return;
    }
    const res = await candidateApi.addExperience({
      company: newExp.company,
      title: newExp.title,
      startDate: new Date(newExp.startDate).toISOString(),
      endDate: newExp.endDate ? new Date(newExp.endDate).toISOString() : undefined,
      description: newExp.description,
    });
    if (res?.success) {
      toast.success("Experience added!");
      setShowExpForm(false);
      setNewExp({ company: "", title: "", startDate: "", endDate: "", isCurrent: false, description: "" });
      loadAllData();
    } else {
      toast.error(res?.message || "Failed to add experience.");
    }
  };

  const handleDeleteExperience = async (id: string) => {
    const res = await candidateApi.deleteExperience(id);
    if (res?.success) {
      toast.success("Experience record removed.");
      loadAllData();
    } else {
      toast.error(res?.message || "Failed to remove experience.");
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProj.name) {
      toast.error("Project name is required.");
      return;
    }
    const res = await candidateApi.addProject(newProj);
    if (res?.success) {
      toast.success("Project added!");
      setShowProjForm(false);
      setNewProj({ name: "", description: "", technologies: "", githubUrl: "", liveUrl: "" });
      loadAllData();
    } else {
      toast.error(res?.message || "Failed to add project.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    const res = await candidateApi.deleteProject(id);
    if (res?.success) {
      toast.success("Project removed.");
      loadAllData();
    } else {
      toast.error(res?.message || "Failed to remove project.");
    }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name) {
      toast.error("Certification name is required.");
      return;
    }
    const res = await candidateApi.addCertification(newCert);
    if (res?.success) {
      toast.success("Certification added!");
      setShowCertForm(false);
      setNewCert({ name: "", issuingOrganization: "", issueDate: "", credentialUrl: "" });
      loadAllData();
    } else {
      toast.error(res?.message || "Failed to add certification.");
    }
  };

  const handleDeleteCertification = async (id: string) => {
    const res = await candidateApi.deleteCertification(id);
    if (res?.success) {
      toast.success("Certification removed.");
      loadAllData();
    } else {
      toast.error(res?.message || "Failed to remove certification.");
    }
  };

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLang.language) {
      toast.error("Language name is required.");
      return;
    }
    const res = await candidateApi.addLanguage(newLang);
    if (res?.success) {
      toast.success("Language added!");
      setShowLangForm(false);
      setNewLang({ language: "", canRead: true, canWrite: true, canSpeak: true });
      loadAllData();
    } else {
      toast.error(res?.message || "Failed to add language.");
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    const res = await candidateApi.deleteLanguage(id);
    if (res?.success) {
      toast.success("Language removed.");
      loadAllData();
    } else {
      toast.error(res?.message || "Failed to remove language.");
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingResume(true);
      const res = await candidateApi.uploadResume(file);
      if (res?.success) {
        toast.success("Resume uploaded successfully!");
        loadAllData();
      } else {
        toast.error(res?.message || "Failed to upload resume.");
      }
    } catch {
      toast.error("Error uploading resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeDelete = async () => {
    if (confirm("Are you sure you want to remove your resume?")) {
      const res = await candidateApi.deleteResume();
      if (res?.success) {
        toast.success("Resume removed.");
        loadAllData();
      } else {
        toast.error(res?.message || "Failed to remove resume.");
      }
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const inputStyle = {
    backgroundColor: "var(--color-bg-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  const completeness = calculateProfileCompleteness(profileData);
  const basic = profileData.basicDetails || {};
  const highestEdu = profileData.education?.[0] || {};

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hidden inputs */}
        <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
        <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} accept=".pdf,.doc,.docx" className="hidden" />

        {/* 1. CANDIDATE PROFILE HEADER CARD */}
        <div
          className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden"
          style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Left: Avatar with Circular Progress Ring */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-800" fill="transparent" />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="#4F46E5"
                    strokeWidth="6"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * completeness) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                    fill="transparent"
                  />
                </svg>

                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute inset-2 rounded-full overflow-hidden border-2 border-white dark:border-gray-900 flex items-center justify-center cursor-pointer bg-slate-100 dark:bg-slate-800"
                >
                  {basic.profilePhotoUrl ? (
                    <img src={basic.profilePhotoUrl} alt="User Avatar" className="object-cover h-full w-full rounded-full" onError={(e) => { (e.target as any).onerror = null; (e.target as any).src = '/images/profileIcon.png'; }} />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-bold rounded-full">
                    {uploadingPhoto ? "Saving..." : "Change"}
                  </div>
                </div>

                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-md">
                  {completeness}%
                </div>
              </div>

              {/* Center Info */}
              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>
                    {basic.fullName || user?.fullName || "Candidate"}
                  </h1>
                  <button onClick={() => setShowBasicModal(true)} className="p-1 text-gray-400 hover:text-indigo-600 transition">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {basic.headline || "Software Engineer / Professional Candidate"}
                </p>

                {highestEdu.degree && (
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {highestEdu.degree} {highestEdu.fieldOfStudy ? `in ${highestEdu.fieldOfStudy}` : ""} from {highestEdu.institution || "University"}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs pt-1" style={{ color: "var(--color-text-muted)" }}>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    {basic.location || "Add Location"}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Phone className="h-3.5 w-3.5" />
                    {basic.phone || "Add Phone"}
                    {basic.phone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Mail className="h-3.5 w-3.5" />
                    {basic.email || user?.email}
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SUB-NAVIGATION TABS BAR */}
          <div className="flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "profile" ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              }`}
              style={activeTab !== "profile" ? { color: "var(--color-text-muted)" } : {}}
            >
              <User className="h-4 w-4" /> View &amp; Edit Profile
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "activity" ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              }`}
              style={activeTab !== "activity" ? { color: "var(--color-text-muted)" } : {}}
            >
              <TrendingUp className="h-4 w-4" /> Activity &amp; Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "resume" ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              }`}
              style={activeTab !== "resume" ? { color: "var(--color-text-muted)" } : {}}
            >
              <FileText className="h-4 w-4" /> Resume Center &amp; ATS
            </button>
          </div>
        </div>

        {/* 3. TAB 1: VIEW & EDIT PROFILE */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-2 hidden lg:block">
            <div
              className="sticky top-24 rounded-3xl border p-4 shadow-sm space-y-1 text-xs font-semibold"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="px-3 py-2 uppercase font-bold text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                Quick Links
              </div>
              {[
                { label: "Preference", id: "sec-preferences", icon: Briefcase },
                { label: "Education", id: "sec-education", icon: GraduationCap },
                { label: "Key Skills", id: "sec-skills", icon: Code2 },
                { label: "Profile Summary", id: "sec-summary", icon: FileText },
                { label: "Projects & Internships", id: "sec-projects", icon: FolderGit2 },
                { label: "Accomplishments", id: "sec-certifications", icon: Award },
                { label: "Resume", id: "sec-resume", icon: FileText },
              ].map(({ label, id, icon: Icon }, index) => (
                <button
                  key={`${id}-${index}`}
                  onClick={() => {
                    if (id === "sec-resume") {
                      setActiveTab("resume");
                    } else {
                      setActiveTab("profile");
                      setTimeout(() => scrollToSection(id), 100);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition"
                  style={{ color: "var(--color-text)" }}
                >
                  <Icon className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Profile Cards */}
          <div className="lg:col-span-9 space-y-8">
            {/* Card 1: Profile Summary */}
            <div
              id="sec-summary"
              className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-4"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <FileText className="h-5 w-5 text-indigo-600" /> Profile Summary
                </h2>
                <button
                  onClick={() => setShowBasicModal(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Summary
                </button>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {basic.summary || "Add a profile summary to highlight your key achievements, experience, and career trajectory."}
              </p>

              <div className="flex items-center justify-between pt-2 border-t text-[11px]" style={{ borderColor: "var(--color-border)" }}>
                <span className="text-slate-400">
                  Length: <strong className="text-indigo-400">{(basic.summary || "").length} characters</strong>
                </span>
                {(basic.summary || "").length >= 50 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Recommended length (&gt;50 chars)
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">
                    Recommendation: Add &gt;50 characters for higher recruiter visibility
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: Career Preferences */}
            <div
              id="sec-preferences"
              className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-4"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <Briefcase className="h-5 w-5 text-indigo-600" /> Career Preferences
                </h2>
                <button
                  onClick={() => setShowBasicModal(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Preferences
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <div>
                  <span className="block font-semibold uppercase text-[10px] text-slate-400">Preferred Work Type</span>
                  <span className="font-bold text-sm text-indigo-400">{basic.preferredWorkType || "HYBRID"}</span>
                </div>
                <div>
                  <span className="block font-semibold uppercase text-[10px] text-slate-400">Target Role / Designation</span>
                  <span className="font-semibold text-slate-200">{basic.headline || "Software Engineer"}</span>
                </div>
                <div>
                  <span className="block font-semibold uppercase text-[10px] text-slate-400">Preferred Location</span>
                  <span className="font-semibold text-slate-200">{basic.location || "Flexible / Remote"}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Key Skills */}
            <div
              id="sec-skills"
              className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-4"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <Code2 className="h-5 w-5 text-indigo-600" /> Key Skills ({profileData.skills.length})
                </h2>
              </div>

              {/* Skill Tag Addition Input */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a new skill tag (e.g. React)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(newSkillInput);
                    }
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(newSkillInput)}
                  className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
                >
                  + Add Skill
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-500">Suggestions:</span>
                {["React", "TypeScript", "Node.js", "Python", "SQL", "Docker", "AWS"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-0.5 hover:border-indigo-500 hover:text-indigo-300 transition"
                  >
                    + {s}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {profileData.skills.length === 0 ? (
                  <p className="text-xs italic text-slate-400">No key skills added yet.</p>
                ) : (
                  profileData.skills.map((s: any, idx: number) => {
                    const skillName = s.name || s;
                    const skillId = s.id || s;
                    return (
                      <span
                        key={idx}
                        className="rounded-xl px-3.5 py-1.5 text-xs font-semibold border border-indigo-800/60 bg-indigo-950/40 text-indigo-300 flex items-center gap-2"
                      >
                        {skillName}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skillId, skillName)}
                          className="hover:text-red-400 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Card 4: Employment History */}
            <div
              id="sec-experience"
              className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-4"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <Briefcase className="h-5 w-5 text-indigo-600" /> Employment &amp; Work Experience
                </h2>
                <button
                  onClick={() => setShowExpForm(!showExpForm)}
                  className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
                >
                  <Plus className="h-4 w-4" /> Add Experience
                </button>
              </div>

              {showExpForm && (
                <form onSubmit={handleAddExperience} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company Name *"
                      value={newExp.company}
                      onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Designation / Title *"
                      value={newExp.title}
                      onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={newExp.startDate}
                      onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="date"
                      value={newExp.endDate}
                      onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <textarea
                    placeholder="Responsibilities and key contributions..."
                    value={newExp.description}
                    onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowExpForm(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                    <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white">Save</button>
                  </div>
                </form>
              )}

              {profileData.experience.length === 0 ? (
                <p className="text-xs italic text-slate-400">No employment records added yet.</p>
              ) : (
                <div className="space-y-3">
                  {profileData.experience.map((exp: any) => (
                    <div key={exp.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{exp.title}</h4>
                        <p className="text-xs text-indigo-400 font-semibold">{exp.company}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}</p>
                        {exp.description && <p className="text-xs text-slate-300 mt-2">{exp.description}</p>}
                      </div>
                      <button onClick={() => handleDeleteExperience(exp.id)} className="p-1.5 text-slate-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 5: Education & Academic Achievements */}
            <div
              id="sec-education"
              className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-4"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <GraduationCap className="h-5 w-5 text-indigo-600" /> Education &amp; Academic Achievements
                </h2>
                <button
                  onClick={() => setShowEduForm(!showEduForm)}
                  className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
                >
                  <Plus className="h-4 w-4" /> Add Education
                </button>
              </div>

              {showEduForm && (
                <form onSubmit={handleAddEducation} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Institution / University *"
                      value={newEdu.institution}
                      onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Degree (e.g., B.Tech / Class XII / Class X) *"
                      value={newEdu.degree}
                      onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Field of Study (e.g. Computer Science)"
                      value={newEdu.fieldOfStudy}
                      onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="End / Passing Year"
                      value={newEdu.endYear}
                      onChange={(e) => setNewEdu({ ...newEdu, endYear: Number(e.target.value) })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Grade / CGPA / %"
                      value={newEdu.grade}
                      onChange={(e) => setNewEdu({ ...newEdu, grade: e.target.value })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowEduForm(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                    <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white">Save</button>
                  </div>
                </form>
              )}

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => {
                    setNewEdu({ institution: "Central Board", degree: "Class XII (Senior Secondary)", fieldOfStudy: "Science (PCM)", startYear: 2018, endYear: 2020, grade: "88%" });
                    setShowEduForm(true);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-slate-800"
                >
                  + Add Class XII Details
                </button>
                <button
                  onClick={() => {
                    setNewEdu({ institution: "Secondary Board", degree: "Class X (High School)", fieldOfStudy: "General Subjects", startYear: 2016, endYear: 2018, grade: "90%" });
                    setShowEduForm(true);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-slate-800"
                >
                  + Add Class X Details
                </button>
              </div>

              {profileData.education.length === 0 ? (
                <p className="text-xs italic text-slate-400">No education records added yet.</p>
              ) : (
                <div className="space-y-3">
                  {profileData.education.map((edu: any) => (
                    <div key={edu.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</h4>
                        <p className="text-xs text-indigo-400 font-semibold">{edu.institution}</p>
                        <p className="text-[11px] text-slate-400 mt-1">Passing Year: {edu.endYear} {edu.grade ? `• Grade: ${edu.grade}` : ""}</p>
                      </div>
                      <button onClick={() => handleDeleteEducation(edu.id)} className="p-1.5 text-slate-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 6: Projects & Internships */}
            <div
              id="sec-projects"
              className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-4"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <FolderGit2 className="h-5 w-5 text-indigo-600" /> Projects &amp; Internships
                </h2>
                <button
                  onClick={() => setShowProjForm(!showProjForm)}
                  className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
                >
                  <Plus className="h-4 w-4" /> Add Project / Internship
                </button>
              </div>

              {showProjForm && (
                <form onSubmit={handleAddProject} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
                  <input
                    type="text"
                    placeholder="Project Title / Role Name *"
                    value={newProj.name}
                    onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                  <textarea
                    placeholder="Project description, responsibilities, impact..."
                    value={newProj.description}
                    onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white resize-none"
                  />
                  <input
                    type="text"
                    placeholder="Technologies Used (e.g. React, Next.js, Node.js)"
                    value={newProj.technologies}
                    onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="url"
                      placeholder="Project URL / Live Demo Link (Optional)"
                      value={newProj.liveUrl}
                      onChange={(e) => setNewProj({ ...newProj, liveUrl: e.target.value })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="url"
                      placeholder="GitHub / Repository Link (Optional)"
                      value={newProj.githubUrl}
                      onChange={(e) => setNewProj({ ...newProj, githubUrl: e.target.value })}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowProjForm(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                    <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white">Save</button>
                  </div>
                </form>
              )}

              {profileData.projects.length === 0 ? (
                <p className="text-xs italic text-slate-400">No project/internship records added yet.</p>
              ) : (
                <div className="space-y-3">
                  {profileData.projects.map((proj: any) => (
                    <div key={proj.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          {proj.name}
                          {proj.liveUrl && (
                            <a href={proj.liveUrl.startsWith("http") ? proj.liveUrl : `https://${proj.liveUrl}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {proj.githubUrl && (
                            <a href={proj.githubUrl.startsWith("http") ? proj.githubUrl : `https://${proj.githubUrl}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                              <FolderGit2 className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </h4>
                        {proj.technologies && <p className="text-xs text-indigo-400 mt-0.5">Tech: {proj.technologies}</p>}
                        {proj.description && <p className="text-xs text-slate-300 mt-1">{proj.description}</p>}
                      </div>
                      <button onClick={() => handleDeleteProject(proj.id)} className="p-1.5 text-slate-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 7: Accomplishments & Certifications */}
            <div
              id="sec-certifications"
              className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-4"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <Award className="h-5 w-5 text-indigo-600" /> Accomplishments &amp; Certifications
                </h2>
                <button
                  onClick={() => setShowCertForm(!showCertForm)}
                  className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
                >
                  <Plus className="h-4 w-4" /> Add Accomplishment
                </button>
              </div>

              {showCertForm && (
                <form onSubmit={handleAddCertification} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
                  <input
                    type="text"
                    placeholder="Certification / Award / Exam Name *"
                    value={newCert.name}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Issuing Organization / Body"
                    value={newCert.issuingOrganization}
                    onChange={(e) => setNewCert({ ...newCert, issuingOrganization: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="url"
                    placeholder="Credential / Certificate Verification Link (Optional)"
                    value={newCert.credentialUrl}
                    onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowCertForm(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                    <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white">Save</button>
                  </div>
                </form>
              )}

              {profileData.certifications.length === 0 ? (
                <p className="text-xs italic text-slate-400">No accomplishments added yet.</p>
              ) : (
                <div className="space-y-3">
                  {profileData.certifications.map((cert: any) => (
                    <div key={cert.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          {cert.name}
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl.startsWith("http") ? cert.credentialUrl : `https://${cert.credentialUrl}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </h4>
                        <p className="text-xs text-indigo-400 font-semibold">{cert.issuingOrganization}</p>
                      </div>
                      <button onClick={() => handleDeleteCertification(cert.id)} className="p-1.5 text-slate-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 8: Languages Known */}
            <div
              id="sec-languages"
              className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-4"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <LanguagesIcon className="h-5 w-5 text-indigo-600" /> Languages Known
                </h2>
                <button
                  onClick={() => setShowLangForm(!showLangForm)}
                  className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
                >
                  <Plus className="h-4 w-4" /> Add Language
                </button>
              </div>

              {showLangForm && (
                <form onSubmit={handleAddLanguage} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
                  <input
                    type="text"
                    placeholder="Language Name (e.g., English, Hindi) *"
                    value={newLang.language}
                    onChange={(e) => setNewLang({ ...newLang, language: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={newLang.canRead} onChange={(e) => setNewLang({ ...newLang, canRead: e.target.checked })} /> Read
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={newLang.canWrite} onChange={(e) => setNewLang({ ...newLang, canWrite: e.target.checked })} /> Write
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={newLang.canSpeak} onChange={(e) => setNewLang({ ...newLang, canSpeak: e.target.checked })} /> Speak
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowLangForm(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                    <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white">Save</button>
                  </div>
                </form>
              )}

              {profileData.languages.length === 0 ? (
                <p className="text-xs italic text-slate-400">No languages added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.languages.map((lang: any) => (
                    <span key={lang.id} className="rounded-xl px-3 py-1 text-xs border border-slate-800 bg-slate-950 text-slate-200 flex items-center gap-2">
                      {lang.language} ({[lang.canRead && "Read", lang.canWrite && "Write", lang.canSpeak && "Speak"].filter(Boolean).join(", ")})
                      <button onClick={() => handleDeleteLanguage(lang.id)} className="text-slate-500 hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVITY & APPLICATIONS */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>My Job Applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>No job applications yet.</p>
                <Link href="/jobs" className="text-xs text-indigo-600 hover:underline mt-1 block font-semibold">
                  Browse open roles &amp; apply now →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <div key={app.id} className="p-4 rounded-2xl border flex items-center justify-between gap-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)" }}>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>{app.job?.title || "Applied Job"}</h4>
                      <p className="text-xs text-gray-500">{app.job?.company?.name || "Company"}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[app.status] || STATUS_STYLES.APPLIED}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RESUME CENTER */}
      {activeTab === "resume" && (
        <div className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <FileText className="h-5 w-5 text-indigo-600" /> Resume Document &amp; ATS Center
              </h2>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Upload your latest resume (PDF/DOCX up to 2MB) or build a formatted resume dynamically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/50 bg-indigo-950/60 px-4 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900/60 transition"
              >
                <Sparkles className="h-4 w-4" /> Print / Export PDF Resume
              </button>
              <button
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploadingResume}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                <Upload className="h-4 w-4" />
                {uploadingResume ? "Uploading..." : "Upload Resume"}
              </button>
            </div>
          </div>

          {profileData.resume?.url || profileData.resumeUrl ? (
            <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)" }}>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="font-bold text-xs" style={{ color: "var(--color-text)" }}>
                    {profileData.resume?.originalName || profileData.resumeOriginalName || "Candidate_Resume.pdf"}
                  </p>
                  <p className="text-[10px] text-gray-500">Resume attached &amp; active (Max 2MB supported)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={profileData.resume?.url || profileData.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition"
                  title="Download / View"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={handleResumeDelete}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
                  title="Remove Resume"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-3xl p-10 text-center space-y-3" style={{ borderColor: "var(--color-border)" }}>
              <Upload className="h-10 w-10 text-indigo-600 mx-auto" />
              <p className="font-bold text-sm" style={{ color: "var(--color-text)" }}>No resume uploaded yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">Upload PDF, DOC, or DOCX format (up to 2MB) to boost your profile score.</p>
              <button
                onClick={() => resumeInputRef.current?.click()}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition inline-block"
              >
                Upload File
              </button>
            </div>
          )}

          {/* Generated Formatted Resume Builder View */}
          <div className="pt-6 border-t border-slate-800 space-y-4 print:p-0 print:border-none">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" /> Formatted Profile Resume Preview
              </h3>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-sm"
              >
                Print / Export PDF
              </button>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 space-y-6 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none">
              <div className="border-b border-slate-800 pb-4 print:border-black">
                <h1 className="text-2xl font-extrabold text-white print:text-black">{basic.fullName || user?.fullName}</h1>
                <p className="text-sm font-bold text-indigo-400 print:text-gray-800 mt-0.5">{basic.headline || "Professional Candidate"}</p>
                <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                  {basic.email || user?.email} • {basic.phone || "Phone N/A"} • {basic.location || "Location N/A"}
                </p>
              </div>

              {basic.summary && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 print:text-gray-700 mb-1">Profile Summary</h4>
                  <p className="text-xs leading-relaxed text-slate-300 print:text-black">{basic.summary}</p>
                </div>
              )}

              {profileData.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 print:text-gray-700 mb-1">Technical &amp; Key Skills</h4>
                  <p className="text-xs text-indigo-300 print:text-black font-semibold">
                    {profileData.skills.map((s: any) => s.name || s).join(" • ")}
                  </p>
                </div>
              )}

              {profileData.experience?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 print:text-gray-700 mb-2">Work Experience</h4>
                  <div className="space-y-3">
                    {profileData.experience.map((exp: any) => (
                      <div key={exp.id}>
                        <div className="flex justify-between text-xs font-bold text-white print:text-black">
                          <span>{exp.title} - {exp.company}</span>
                          <span className="text-slate-400 print:text-gray-600 font-normal">
                            {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}
                          </span>
                        </div>
                        {exp.description && <p className="text-xs text-slate-300 print:text-gray-800 mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profileData.education?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 print:text-gray-700 mb-2">Education</h4>
                  <div className="space-y-2">
                    {profileData.education.map((edu: any) => (
                      <div key={edu.id} className="flex justify-between text-xs text-slate-300 print:text-black">
                        <div>
                          <span className="font-bold text-white print:text-black">{edu.degree}</span> - {edu.institution}
                        </div>
                        <span className="text-slate-400 print:text-gray-600">Year: {edu.endYear}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profileData.projects?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 print:text-gray-700 mb-2">Projects &amp; Internships</h4>
                  <div className="space-y-2">
                    {profileData.projects.map((proj: any) => (
                      <div key={proj.id} className="text-xs">
                        <div className="font-bold text-white print:text-black">{proj.name}</div>
                        {proj.description && <p className="text-slate-300 print:text-gray-800 mt-0.5">{proj.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT BASIC PROFILE / SUMMARY / PREFERENCES MODAL */}
      {showBasicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-indigo-500" /> Edit Candidate Profile Details
              </h3>
              <button onClick={() => setShowBasicModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBasic} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={basicForm.fullName}
                    onChange={(e) => setBasicForm({ ...basicForm, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Headline / Target Role</label>
                  <input
                    type="text"
                    value={basicForm.headline}
                    onChange={(e) => setBasicForm({ ...basicForm, headline: e.target.value })}
                    placeholder="e.g. Full Stack Developer"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={basicForm.phone}
                    onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Current Location</label>
                  <input
                    type="text"
                    value={basicForm.location}
                    onChange={(e) => setBasicForm({ ...basicForm, location: e.target.value })}
                    placeholder="Bangalore, India"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Preferred Work Type</label>
                  <select
                    value={basicForm.preferredWorkType}
                    onChange={(e) => setBasicForm({ ...basicForm, preferredWorkType: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="ONSITE">Onsite</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Profile Photo / Image URL</label>
                  <input
                    type="url"
                    value={basicForm.profilePhotoUrl || ""}
                    onChange={(e) => setBasicForm({ ...basicForm, profilePhotoUrl: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Resume URL / Link</label>
                <input
                  type="url"
                  value={basicForm.resumeUrl || ""}
                  onChange={(e) => setBasicForm({ ...basicForm, resumeUrl: e.target.value })}
                  placeholder="https://example.com/resume.pdf"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-400">Profile Summary</label>
                  <span className="text-[11px] text-indigo-400">{(basicForm.summary || "").length} characters</span>
                </div>
                <textarea
                  rows={4}
                  value={basicForm.summary}
                  onChange={(e) => setBasicForm({ ...basicForm, summary: e.target.value })}
                  placeholder="Highlight your background, core technical strengths, key accomplishments, and career goals..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBasicModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBasic}
                  className="rounded-xl bg-indigo-600 px-6 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  {savingBasic ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
