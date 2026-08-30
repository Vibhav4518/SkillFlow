"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Monitor, Bell, ShieldCheck, Briefcase, UserCheck } from "lucide-react";

function ToggleRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [enabled, setEnabled] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex-1 mr-4">
        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          enabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-700"
        }`}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

const CANDIDATE_NOTIFICATION_OPTIONS = [
  { label: "Application Status Updates", desc: "Get instant notifications when employers update your application stage", defaultOn: true },
  { label: "Recommended Job Alerts", desc: "Receive automated role recommendations matching your skills & location", defaultOn: true },
  { label: "Employer Outreach", desc: "Receive direct interview invites and messages from hiring managers", defaultOn: true },
  { label: "Platform Announcements", desc: "Stay informed about platform features and career tips", defaultOn: false },
];

const EMPLOYER_NOTIFICATION_OPTIONS = [
  { label: "Company Verification Status", desc: "Get notified when admin reviews your submitted company credentials", defaultOn: true },
  { label: "New Job Application Alerts", desc: "Receive instant notifications when candidates apply to open postings", defaultOn: true },
  { label: "Applicant Shortlist Reminders", desc: "Get reminders to review pending applications in pipeline", defaultOn: true },
  { label: "Job Promotion & Expiration", desc: "Alerts when active job postings require renewal", defaultOn: false },
];

const ADMIN_NOTIFICATION_OPTIONS = [
  { label: "New Candidate Registrations", desc: "Get notified whenever a new candidate creates an account", defaultOn: true },
  { label: "New Employer & Company Submissions", desc: "Alerts when an employer submits company verification credentials", defaultOn: true },
  { label: "System Audit & Security Alerts", desc: "Security and rate limiting warnings across administrative endpoints", defaultOn: true },
  { label: "Contact Form Messages", desc: "Get notified when visitors submit support or contact inquiries", defaultOn: true },
];

function SettingsContent() {
  const { user } = useAuth();
  const toast = useToast();

  const role = user?.role || "CANDIDATE";
  const notificationOptions =
    role === "ADMIN"
      ? ADMIN_NOTIFICATION_OPTIONS
      : role === "EMPLOYER"
      ? EMPLOYER_NOTIFICATION_OPTIONS
      : CANDIDATE_NOTIFICATION_OPTIONS;

  const handleSavePreferences = () => {
    toast.success("Notification preferences saved!");
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>Settings</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Customize your SkillFlow experience for <span className="font-semibold text-indigo-600">{role}</span>
            </p>
          </div>
          <button
            onClick={handleSavePreferences}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
          >
            Save Preferences
          </button>
        </div>

        {/* Appearance */}
        <div className="rounded-3xl border p-6 sm:p-8 shadow-sm mb-6" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl" style={{ backgroundColor: "rgba(99,102,241,0.1)" }}>
              <Monitor className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: "var(--color-text)" }}>Appearance</h2>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Choose how SkillFlow looks on your device</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Role Customized Notifications */}
        <div className="rounded-3xl border p-6 sm:p-8 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl" style={{ backgroundColor: "rgba(6,182,212,0.1)" }}>
              <Bell className="h-4 w-4 text-cyan-600" />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: "var(--color-text)" }}>
                {role === "ADMIN" ? "Admin Security & Verification Alerts" : role === "EMPLOYER" ? "Employer Notification Preferences" : "Candidate Notification Preferences"}
              </h2>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Role-specific notification controls for {user?.email}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {notificationOptions.map((opt) => (
              <ToggleRow key={opt.label} {...opt} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
