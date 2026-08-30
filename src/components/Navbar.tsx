"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useEmployerVerification } from "@/hooks/useEmployerVerification";
import SkillFlowLogo from "@/components/SkillFlowLogo";
import NotificationDropdown from "@/components/NotificationDropdown";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  Menu, X, User, LogOut, LayoutDashboard, Briefcase,
  PlusCircle, ShieldCheck, Settings, Bell, Bookmark, FileText
} from "lucide-react";

function Avatar({ name, photoUrl, size = "sm" }: { name?: string; photoUrl?: string; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  if (photoUrl) {
    return (
      <div className={`${sz} relative overflow-hidden rounded-full border border-slate-700 shrink-0 bg-slate-800`}>
        <Image src={photoUrl} alt={name || "User avatar"} width={40} height={40} className="h-full w-full object-cover rounded-full" unoptimized />
      </div>
    );
  }
  return (
    <div className={`${sz} flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300 shrink-0`}>
      <User className="h-4 w-4" />
    </div>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { success } = useToast();
  const { verifyOrWarn } = useEmployerVerification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    success("Logged out successfully");
    router.replace("/");
  };

  const getProfileUrl = () => {
    if (!user?.role) return "/candidate/dashboard";
    const role = user.role.toUpperCase();
    if (role === "ADMIN") return "/admin/profile";
    if (role === "EMPLOYER") return "/employer/company";
    return "/candidate/dashboard";
  };

  const getDashboardUrl = () => {
    if (!user?.role) return "/candidate/dashboard";
    const role = user.role.toUpperCase();
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "EMPLOYER") return "/employer/dashboard";
    return "/candidate/dashboard";
  };

  const getBookmarksUrl = () => {
    if (!user?.role) return "/candidate/bookmarks";
    const role = user.role.toUpperCase();
    if (role === "EMPLOYER") return "/employer/bookmarks";
    return "/candidate/bookmarks";
  };

  const displayName = user?.fullName || "My Account";
  const firstName = displayName.split(" ")[0];
  const avatarPhoto = (user as any)?.photoUrl || (user as any)?.avatar || (user as any)?.candidateProfile?.photoUrl || (user as any)?.employerProfile?.logoUrl;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-md text-slate-100 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <SkillFlowLogo />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {isAuthenticated && user?.role === "EMPLOYER" ? (
            <>
              <Link href="/employer/jobs" className="transition hover:text-white">
                My Jobs
              </Link>
              <Link href="/employer/applications" className="transition hover:text-white">
                Applications
              </Link>
            </>
          ) : isAuthenticated && user?.role === "CANDIDATE" ? (
            <>
              <Link href="/jobs" className="transition hover:text-white">
                Browse Jobs
              </Link>
              <Link href="/about" className="transition hover:text-white">
                About
              </Link>
              <Link href="/contact" className="transition hover:text-white">
                Contact
              </Link>
            </>
          ) : isAuthenticated && user?.role === "ADMIN" ? (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1 font-semibold text-purple-400 transition hover:text-purple-300"
            >
              <ShieldCheck className="h-4 w-4" /> Admin Console
            </Link>
          ) : (
            <>
              <Link href="/jobs" className="transition hover:text-white">
                Browse Jobs
              </Link>
              <Link href="/about" className="transition hover:text-white">
                About
              </Link>
              <Link href="/contact" className="transition hover:text-white">
                Contact
              </Link>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle compact />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationDropdown />

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-800/80 px-2.5 py-1 text-sm font-medium text-slate-200 hover:bg-slate-800 transition shadow-sm"
                  aria-label="Open user menu"
                  aria-expanded={userDropdownOpen}
                >
                  <Avatar name={displayName} photoUrl={avatarPhoto} />
                  <span className="max-w-[120px] truncate text-xs font-semibold pr-1">{firstName}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 text-slate-200">
                    <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
                      <p className="font-semibold text-sm truncate text-white">
                        {displayName}
                      </p>
                      <p className="text-xs truncate text-slate-400">
                        {user?.email}
                      </p>
                      <span className="mt-1 inline-block rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {/* Dashboard link */}
                      <Link
                        href={getDashboardUrl()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition hover:bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <LayoutDashboard className="h-4 w-4 text-slate-400" />
                        Dashboard
                      </Link>

                      {/* Employer specific Post a Job link */}
                      {user?.role === "EMPLOYER" && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setUserDropdownOpen(false);
                            verifyOrWarn(() => router.push("/employer/jobs/create"));
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 text-left"
                        >
                          <PlusCircle className="h-4 w-4 text-indigo-400" />
                          Post a Job
                        </button>
                      )}

                      {/* Bookmarks link */}
                      {user?.role !== "ADMIN" && (
                        <Link
                          href={getBookmarksUrl()}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition hover:bg-slate-800 text-slate-300 hover:text-white"
                        >
                          <Bookmark className="h-4 w-4 text-slate-400" />
                          {user?.role === "EMPLOYER" ? "Bookmarked Candidates" : "Bookmarks"}
                        </Link>
                      )}

                      {/* Candidate specific My Applications link */}
                      {user?.role === "CANDIDATE" && (
                        <Link
                          href="/candidate/applications"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition hover:bg-slate-800 text-slate-300 hover:text-white"
                        >
                          <FileText className="h-4 w-4 text-slate-400" />
                          My Applications
                        </Link>
                      )}

                      {/* Notification link in dropdown for all roles */}
                      <Link
                        href="/notifications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition hover:bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Bell className="h-4 w-4 text-slate-400" />
                        Notification
                      </Link>

                      {/* Common Settings link */}
                      <Link
                        href="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition hover:bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        Settings
                      </Link>

                      <div className="my-1 border-t border-slate-800" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle compact />
          {isAuthenticated && <NotificationDropdown />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white transition"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-5 space-y-4 text-slate-200">
          <Link href="/jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold hover:text-white">Browse Jobs</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold hover:text-white">About</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold hover:text-white">Contact</Link>

          {isAuthenticated ? (
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <div className="flex items-center gap-3 px-1 pb-3">
                <Avatar name={displayName} photoUrl={avatarPhoto} size="md" />
                <div>
                  <p className="font-bold text-sm text-white">{displayName}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              <Link href={getProfileUrl()} onClick={() => setMobileMenuOpen(false)} className="block py-2 font-semibold text-slate-300 hover:text-white">My Profile</Link>
              <Link href={getDashboardUrl()} onClick={() => setMobileMenuOpen(false)} className="block py-2 font-semibold text-indigo-400 hover:text-indigo-300">Go to Dashboard</Link>
              <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-semibold text-slate-300 hover:text-white">Settings</Link>
              <button onClick={handleLogout} className="block w-full text-left py-2 font-semibold text-red-400 hover:text-red-300">Sign Out</button>
            </div>
          ) : (
            <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center rounded-xl border border-slate-700 py-2.5 font-semibold text-slate-200">Sign In</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center rounded-xl bg-indigo-600 py-2.5 font-semibold text-white">Create Free Account</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
