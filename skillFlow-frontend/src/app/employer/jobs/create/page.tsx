"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { jobApi } from "@/services/job.api";
import { useToast } from "@/context/ToastContext";
import SkillAutocomplete from "@/components/SkillAutocomplete";
import { ArrowLeft, PlusCircle, ShieldAlert } from "lucide-react";

function CreateJobContent() {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "Bangalore, India",
    workType: "HYBRID",
    jobType: "FULL_TIME",
    salaryMin: 500000,
    salaryMax: 1200000,
    experienceMin: 1,
    experienceMax: 4,
    vacancies: 1,
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>(["React", "TypeScript", "Node.js"]);
  const [loading, setLoading] = useState(false);
  const [unverifiedNotice, setUnverifiedNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent, targetStatus: "PUBLISHED" | "SUBMITTED" | "DRAFT" = "PUBLISHED") => {
    e.preventDefault();
    setUnverifiedNotice(false);

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Job title and description are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await jobApi.createJob({
        ...form,
        salaryMin: Number(form.salaryMin) || undefined,
        salaryMax: Number(form.salaryMax) || undefined,
        experienceMin: Number(form.experienceMin) || 0,
        experienceMax: Number(form.experienceMax) || 0,
        vacancies: Number(form.vacancies) || 1,
        skills: selectedSkills,
        status: targetStatus,
      });

      if (res?.success) {
        toast.success(targetStatus === "DRAFT" ? "Job draft saved!" : "Job opening published successfully!");
        router.push("/employer/jobs");
      } else {
        if (res?.message?.toLowerCase().includes("verification") || res?.message?.toLowerCase().includes("unapproved")) {
          setUnverifiedNotice(true);
        }
        toast.error(res?.message || "Failed to post job listing.");
      }
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes("verification") || err?.message?.toLowerCase().includes("unapproved")) {
        setUnverifiedNotice(true);
      }
      toast.error(err?.message || "Network error occurred while posting job.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-bg-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/employer/dashboard"
          className="text-xs font-semibold inline-flex items-center gap-1 mb-4 hover:opacity-80 transition"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: "var(--color-text)" }}>
          Create Job Opening
        </h1>
        <p className="text-xs mb-8" style={{ color: "var(--color-text-muted)" }}>
          Publish a new position and start receiving verified candidate applications
        </p>

        {unverifiedNotice && (
          <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-950/40 p-5 text-amber-300 flex items-start gap-3 shadow-lg">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-200">Employer Verification Pending</h4>
              <p className="text-xs text-amber-300/90 mt-1 leading-relaxed">
                Your employer account is currently pending admin verification. You can post jobs once verified by an admin.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border p-8 shadow-sm space-y-6"
          style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>
              Job Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                Work Type
              </label>
              <select
                value={form.workType}
                onChange={(e) => setForm({ ...form, workType: e.target.value })}
                className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              >
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                Job Type
              </label>
              <select
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Bangalore, India"
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                Vacancies
              </label>
              <input
                type="number"
                value={form.vacancies}
                onChange={(e) => setForm({ ...form, vacancies: Number(e.target.value) })}
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                Min Salary (₹ Annual)
              </label>
              <input
                type="number"
                value={form.salaryMin}
                onChange={(e) => setForm({ ...form, salaryMin: Number(e.target.value) })}
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                Max Salary (₹ Annual)
              </label>
              <input
                type="number"
                value={form.salaryMax}
                onChange={(e) => setForm({ ...form, salaryMax: Number(e.target.value) })}
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>
              Required Skills
            </label>
            <SkillAutocomplete
              selectedSkills={selectedSkills}
              onAddSkill={(s) => setSelectedSkills((prev) => prev.includes(s) ? prev : [...prev, s])}
              onRemoveSkill={(s) => setSelectedSkills((prev) => prev.filter((item) => item !== s))}
              placeholder="Search or type required skills (e.g. Java, React, Docker)..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>
              Job Description &amp; Requirements
            </label>
            <textarea
              rows={6}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe roles, daily responsibilities, technical requirements, and benefits..."
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
            <Link
              href="/employer/dashboard"
              className="rounded-xl border px-4 py-2.5 text-xs font-semibold transition"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, "DRAFT")}
              className="rounded-xl border px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, "PUBLISHED")}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <PlusCircle className="h-4 w-4" />
              {loading ? "Publishing..." : "Publish Job Opening"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]}>
      <CreateJobContent />
    </ProtectedRoute>
  );
}
