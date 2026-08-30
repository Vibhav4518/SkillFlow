"use client";

import Link from "next/link";
import SkillFlowLogo from "@/components/SkillFlowLogo";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { isAuthenticated, user } = useAuth();
  const role = user?.role?.toUpperCase();

  return (
    <footer className="border-t bg-slate-950 text-slate-400 border-slate-900 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <SkillFlowLogo light />
            <p className="text-sm leading-relaxed text-slate-400">
              SkillFlow connects top candidates with leading global employers through streamlined hiring workflows, verified skill profiles, and automated pipeline intelligence.
            </p>
          </div>

          {/* Role Aware Navigation Column 1 */}
          {role === "ADMIN" ? (
            <div>
              <h4 className="font-semibold text-sm mb-3 text-white">Admin Console</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/admin/dashboard" className="hover:text-purple-400 transition">Admin Dashboard</Link></li>
                <li><Link href="/admin/users" className="hover:text-purple-400 transition">User Management</Link></li>
                <li><Link href="/admin/companies" className="hover:text-purple-400 transition">Company Verifications</Link></li>
                <li><Link href="/admin/jobs" className="hover:text-purple-400 transition">Job Moderation</Link></li>
              </ul>
            </div>
          ) : role === "EMPLOYER" ? (
            <div>
              <h4 className="font-semibold text-sm mb-3 text-white">For Employers</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/employer/dashboard" className="hover:text-indigo-400 transition">Employer Dashboard</Link></li>
                <li><Link href="/employer/jobs/create" className="hover:text-indigo-400 transition">Post a Job</Link></li>
                <li><Link href="/employer/jobs" className="hover:text-indigo-400 transition">Manage Postings</Link></li>
                <li><Link href="/employer/applications" className="hover:text-indigo-400 transition">Hiring Pipeline</Link></li>
                <li><Link href="/employer/company" className="hover:text-indigo-400 transition">Company Profile</Link></li>
              </ul>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-sm mb-3 text-white">For Candidates</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/jobs" className="hover:text-indigo-400 transition">Browse Jobs</Link></li>
                <li><Link href="/candidate/dashboard" className="hover:text-indigo-400 transition">Candidate Dashboard</Link></li>
                <li><Link href="/candidate/profile" className="hover:text-indigo-400 transition">My Profile</Link></li>
                <li><Link href="/candidate/resume" className="hover:text-indigo-400 transition">Resume Center</Link></li>
                <li><Link href="/candidate/applications" className="hover:text-indigo-400 transition">Track Applications</Link></li>
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Platform Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-indigo-400 transition">About SkillFlow</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-400 transition">Contact &amp; Support</Link></li>
              <li><Link href="/jobs" className="hover:text-indigo-400 transition">Explore Opportunities</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Security &amp; Account</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {isAuthenticated ? (
                <>
                  <li><Link href="/settings" className="hover:text-indigo-400 transition">Account Settings</Link></li>
                  <li><span className="text-xs uppercase font-bold tracking-wider text-indigo-400">{user?.role} ACCOUNT</span></li>
                </>
              ) : (
                <>
                  <li><Link href="/login" className="hover:text-indigo-400 transition">Sign In</Link></li>
                  <li><Link href="/register" className="hover:text-indigo-400 transition">Create Account</Link></li>
                  <li><Link href="/admin/login" className="hover:text-purple-400 transition">Admin Portal</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} SkillFlow Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-slate-300 transition">Privacy Policy</Link>
            <Link href="/about" className="hover:text-slate-300 transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-300 transition">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
