"use client";

import Link from "next/link";
import { ShieldCheck, Zap, Users, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Header */}
      <section className="py-16 lg:py-24 border-b" style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">About SkillFlow</span>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl" style={{ color: "var(--color-text)" }}>
            Reinventing the Hiring Experience
          </h1>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            SkillFlow is a unified hiring and talent verification platform built to eliminate recruiting friction, ensure transparency, and accelerate meaningful career matches.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-3xl border p-8 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>High-Precision Matching</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              We connect candidates and job openings based on verified technical abilities, domain experience, and work culture alignment.
            </p>
          </div>

          <div className="rounded-3xl border p-8 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Verified Organizations</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Our moderation standards ensure all participating companies are authentic, protecting job seekers from fraudulent postings.
            </p>
          </div>

          <div className="rounded-3xl border p-8 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Transparent Pipeline</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              No black-hole resumes. Candidates receive deterministic progress updates across Shortlisting, Interviews, and Selection.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t" style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>Ready to take the next step?</h2>
          <p className="mt-3 text-sm" style={{ color: "var(--color-text-muted)" }}>Join thousands of professionals and high-growth organizations on SkillFlow today.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition">
              Create Free Account
            </Link>
            <Link href="/jobs" className="rounded-xl border px-6 py-3 text-sm font-semibold transition" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
              Browse Open Roles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
