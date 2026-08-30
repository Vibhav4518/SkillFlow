"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/services/auth.api";
import { useToast } from "@/context/ToastContext";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, ShieldAlert } from "lucide-react";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const tokenParam = searchParams?.get("token") || "";
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
  }, [tokenParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) {
      setErrorMsg("Password reset token is missing.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.resetPassword({ token, newPassword });
      if (res?.success) {
        setSuccess(true);
        toast.success(res.message || "Password updated successfully!");
      } else {
        setErrorMsg(res?.message || "Failed to update password.");
        toast.error(res?.message || "Failed to update password.");
      }
    } catch {
      setErrorMsg("Failed to connect to authentication server.");
      toast.error("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-4 shadow-lg">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Set New Password</h1>
        <p className="text-xs text-slate-400 mt-1">
          Create a strong new password for your SkillFlow account
        </p>
      </div>

      {success ? (
        <div className="space-y-5 text-center">
          <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-bold text-base text-emerald-300">Password Updated!</h3>
            <p className="text-xs text-emerald-400/80 mt-1">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition shadow-lg"
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!tokenParam && (
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5 text-slate-400">
                Authorization Token
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste reset token here..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5 text-slate-400">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5 text-slate-400">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-800/80 p-3 text-xs text-red-300 font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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

        <Suspense fallback={
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent mx-auto" />
          </div>
        }>
          <ResetPasswordFormContent />
        </Suspense>
      </div>
    </div>
  );
}
