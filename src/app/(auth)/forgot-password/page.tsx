"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/services/auth.api";
import { useToast } from "@/context/ToastContext";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await authApi.forgotPassword(email);
      if (res?.success) {
        setSubmitted(true);
        if (res.resetToken) {
          setResetToken(res.resetToken);
        }
        toast.success(res.message || "Password reset link generated!");
      } else {
        toast.error(res?.message || "Failed to process request.");
      }
    } catch {
      toast.error("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/login"
            className="text-xs font-semibold inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-4 shadow-lg">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Reset Your Password</h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your account email to receive password reset instructions
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-5 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-emerald-300">Instructions Sent</h3>
                <p className="text-xs text-emerald-400/80 mt-1">
                  We generated a password reset authorization for <span className="font-semibold text-white">{email}</span>.
                </p>
              </div>

              {resetToken && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dev Reset Authorization Link:</p>
                  <Link
                    href={`/reset-password?token=${resetToken}`}
                    className="block p-3 rounded-xl bg-indigo-950/80 border border-indigo-800 text-xs font-bold text-indigo-300 hover:text-white truncate transition"
                  >
                    /reset-password?token={resetToken.slice(0, 20)}...
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5 text-slate-400">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
                  />
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating Token...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
