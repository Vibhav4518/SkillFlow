"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/services/auth.api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import SkillFlowLogo from "@/components/SkillFlowLogo";
import { ShieldCheck, Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");

    if (!email || !password) {
      setFieldError("Please provide administrative email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({ email, password });

      const userData = res?.data?.user || res?.user;
      const token = res?.data?.accessToken || res?.accessToken;

      if (!userData || !token) {
        toast.error(res?.message || "Invalid administrative credentials.");
        return;
      }

      const role = (userData?.role || "").toUpperCase();

      if (role !== "ADMIN") {
        await logout();
        toast.error("You are not authorized to access the admin portal.");
        setFieldError("Access denied. Administrative role required.");
        return;
      }

      login(token, userData);
      toast.success("Admin logged in successfully");
      router.replace("/");
    } catch {
      toast.error("Failed to connect to authentication server.");
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
    <div
      className="flex min-h-[85vh] items-center justify-center py-16 px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/"
            className="text-xs font-semibold inline-flex items-center gap-1.5 hover:opacity-80 transition"
            style={{ color: "var(--color-text-muted)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Platform
          </Link>
          <SkillFlowLogo />
        </div>

        <div
          className="rounded-3xl border p-8 shadow-xl relative overflow-hidden"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white mb-4 shadow-lg shadow-purple-500/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1
              className="text-2xl font-extrabold"
              style={{ color: "var(--color-text)" }}
            >
              Admin Console Login
            </h1>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Restricted portal for authorized system administrators
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skillflow.com"
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-muted)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {fieldError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                {fieldError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{" "}
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Authenticate Admin
                </>
              )}
            </button>
          </form>

          <div
            className="mt-6 text-center text-xs border-t pt-4"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            Candidate or Employer?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Standard Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
