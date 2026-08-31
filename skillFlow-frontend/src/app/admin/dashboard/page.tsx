"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import {
  Users, Briefcase, Building2, MessageSquare,
  ListCheck, ShieldCheck, FileCheck2, Code2
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
        <p className="text-3xl font-extrabold mt-3" style={{ color: "var(--color-text)" }}>{value ?? 0}</p>
      )}
      {sub && <div className="mt-1.5">{sub}</div>}
    </div>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await adminApi.getStats();
        if (res?.success && res?.data) setStats(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const navCards = [
    { href: "/admin/users", label: "User Management", Icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { href: "/admin/skills", label: "Skills Directory", Icon: Code2, color: "text-violet-600", bg: "bg-violet-50" },
    { href: "/admin/companies", label: "Company Verifications", Icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
    { href: "/admin/jobs", label: "Jobs Moderation", Icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { href: "/admin/applications", label: "Applications", Icon: FileCheck2, color: "text-cyan-600", bg: "bg-cyan-50" },
    { href: "/admin/contact-messages", label: "Support Inquiries", Icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
    { href: "/admin/audit-logs", label: "Audit Logs", Icon: ListCheck, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-purple-600" />
            <span className="rounded-full px-3 py-1 text-xs font-bold bg-purple-50 text-purple-700">Platform Superadmin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text)" }}>SkillFlow Administration</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Platform oversight, enterprise verification, and resource management</p>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {navCards.map(({ href, label, Icon, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border p-4 shadow-sm transition hover:shadow-md flex flex-col items-start gap-2"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <span className="text-xs font-bold" style={{ color: "var(--color-text)" }}>{label}</span>
            </Link>
          ))}
        </div>

        {/* Metrics Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard label="Total Accounts" value={stats.totalUsers} icon={Users} iconColor="text-purple-600" loading={loading}
            sub={<p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{stats.totalCandidates ?? 0} candidates · {stats.totalEmployers ?? 0} employers · {stats.totalAdmins ?? 0} admins</p>}
          />
          <StatCard label="Organizations" value={stats.totalCompanies} icon={Building2} iconColor="text-indigo-600" loading={loading}
            sub={<p className="text-xs" style={{ color: "var(--color-text-muted)" }}><span className="text-emerald-600 font-semibold">{stats.verifiedCompanies ?? 0} verified</span> · <span className="text-amber-600">{stats.pendingCompanies ?? 0} pending</span></p>}
          />
          <StatCard label="Job Listings" value={stats.totalJobs} icon={Briefcase} iconColor="text-blue-600" loading={loading}
            sub={<p className="text-xs" style={{ color: "var(--color-text-muted)" }}><span className="text-emerald-600 font-semibold">{stats.publishedJobs ?? 0} live</span> · {stats.draftJobs ?? 0} draft · {stats.closedJobs ?? 0} closed</p>}
          />
          <StatCard label="Total Applications" value={stats.totalApplications} icon={FileCheck2} iconColor="text-cyan-600" loading={loading}
            sub={<p className="text-xs text-emerald-600 font-semibold">{stats.selected ?? stats.selectedCandidates ?? 0} hired</p>}
          />
        </div>

        {/* Metrics Row 2 - Application pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: "Applied", value: stats.applied, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "In Progress", value: stats.inProgress, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
            { label: "Shortlisted", value: stats.shortlisted, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
            { label: "Interview", value: stats.interview, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
            { label: "Selected", value: stats.selected, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "Rejected", value: stats.rejected, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl p-4 ${bg}`}>
              <p className={`text-xs font-semibold ${color}`}>{label}</p>
              {loading ? (
                <div className="mt-1.5 h-7 w-12 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
              ) : (
                <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value ?? 0}</p>
              )}
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>Recent Users</h3>
              <Link href="/admin/users" className="text-xs text-indigo-600 font-semibold hover:underline">View all</Link>
            </div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-3 border-b animate-pulse" style={{ borderColor: "var(--color-border)" }}>
                  <div className="h-3 w-40 rounded" style={{ backgroundColor: "var(--color-bg-muted)" }} />
                </div>
              ))
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                {(stats.recentUsers || []).slice(0, 5).map((u: any) => (
                  <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold" style={{ color: "var(--color-text)" }}>{u.fullName}</p>
                      <p style={{ color: "var(--color-text-muted)" }}>{u.email}</p>
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }}>{u.role}</span>
                  </div>
                ))}
                {(!stats.recentUsers || stats.recentUsers.length === 0) && (
                  <p className="py-4 text-xs text-center" style={{ color: "var(--color-text-muted)" }}>No recent users found.</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>Recent Job Submissions</h3>
              <Link href="/admin/jobs" className="text-xs text-indigo-600 font-semibold hover:underline">View all</Link>
            </div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-3 border-b animate-pulse" style={{ borderColor: "var(--color-border)" }}>
                  <div className="h-3 w-40 rounded" style={{ backgroundColor: "var(--color-bg-muted)" }} />
                </div>
              ))
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                {(stats.recentJobs || []).slice(0, 5).map((j: any) => (
                  <div key={j.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold" style={{ color: "var(--color-text)" }}>{j.title}</p>
                      <p style={{ color: "var(--color-text-muted)" }}>{j.company?.name || "Company"}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      j.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>{j.status}</span>
                  </div>
                ))}
                {(!stats.recentJobs || stats.recentJobs.length === 0) && (
                  <p className="py-4 text-xs text-center" style={{ color: "var(--color-text-muted)" }}>No recent jobs found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
