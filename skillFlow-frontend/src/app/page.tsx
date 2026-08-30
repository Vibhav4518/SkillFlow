"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jobApi } from "@/services/job.api";
import { Search, MapPin, Briefcase, Sparkles, Building2, CheckCircle2, ArrowRight, TrendingUp } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await jobApi.getJobs({ limit: 6 });
        if (res.success && res.data) {
          setFeaturedJobs(Array.isArray(res.data) ? res.data : res.data.jobs || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-600/10 via-indigo-600/5 to-transparent py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-gray-900 shadow-sm mb-6 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>The Next-Gen Career & Hiring Ecosystem</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight" style={{ color: "var(--color-text)" }}>
              Where verified skills meet <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">boundless opportunity.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              SkillFlow empowers job seekers to showcase validated competencies and helps employers hire top-tier talent with complete pipeline transparency.
            </p>

            {/* Hero Search Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const params = new URLSearchParams();
                if (search.trim()) params.set("search", search.trim());
                if (location.trim()) params.set("location", location.trim());
                const query = params.toString();
                router.push(`/jobs${query ? `?${query}` : ""}`);
              }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-2 rounded-2xl border p-2 shadow-xl shadow-indigo-900/5"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex flex-1 items-center gap-2 px-3 py-2 w-full">
                <Search className="h-5 w-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                />
              </div>

              <div className="hidden sm:block h-6 w-px" style={{ backgroundColor: "var(--color-border)" }} />

              <div className="flex flex-1 items-center gap-2 px-3 py-2 w-full">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="City, state, or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
              >
                Find Jobs
              </button>
            </form>          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--color-text)" }}>Featured Opportunities</h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Explore recently opened positions from verified organizations</p>
            </div>
            <Link href="/jobs" className="mt-4 sm:mt-0 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View all jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="group relative flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                      {job.workType || "Full-time"}
                    </span>
                    {job.salaryMin && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg group-hover:text-indigo-600 transition" style={{ color: "var(--color-text)" }}>
                    {job.title}
                  </h3>

                  <p className="text-sm mt-1 font-medium" style={{ color: "var(--color-text-muted)" }}>
                    {job.company?.name || "Verified Partner"}
                  </p>

                  <p className="text-xs line-clamp-2 mt-3 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {job.description}
                  </p>
                </div>

                <div className="mt-6 border-t pt-4 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-subtle)" }}>
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location || "Remote"}
                  </span>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Benefits Grid */}
      <section className="py-16 border-t border-b" style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>Designed for modern hiring</h2>
            <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>Whether you&apos;re taking your next career leap or building a world-class team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Candidate Card */}
            <div className="rounded-3xl border p-8 sm:p-10 shadow-sm relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>For Candidates</h3>
              <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>Create an authenticated skill profile, apply seamlessly, and track pipeline progress in real-time.</p>
              <ul className="mt-6 space-y-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Verified skills & portfolio highlights</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Live status updates from employers</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> One-click tailored job applications</li>
              </ul>
              <div className="mt-8">
                <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                  Join as Candidate <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Employer Card */}
            <div className="rounded-3xl border p-8 sm:p-10 shadow-sm relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>For Employers</h3>
              <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>Publish roles, review candidate dossiers, and collaborate with structured status pipelines.</p>
              <ul className="mt-6 space-y-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" /> Post and manage job requirements</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" /> Integrated candidate review pipeline</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" /> Verified company badge & trust rating</li>
              </ul>
              <div className="mt-8">
                <Link href="/register" className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold hover:opacity-80" style={{ backgroundColor: "var(--color-text)", color: "var(--color-bg)" }}>
                  Hire on SkillFlow <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
