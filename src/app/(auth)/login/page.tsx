"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/services/auth.api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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
      setFieldError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({ email, password });

      const userData = res?.data?.user || res?.user;
      const token = res?.data?.accessToken || res?.accessToken;

      if (!userData || !token) {
        toast.error(res?.message || "Invalid email or password.");
        return;
      }

      login(token, userData);
      toast.success("Login successful!");
      router.replace("/");
    } catch {
      toast.error("Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-1 items-center justify-center py-16 px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-3xl border p-8 shadow-md"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white mb-4">
              <LogIn className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-text)" }}>
              Welcome Back
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              Sign in to your SkillFlow account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-bg-input)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-xs font-semibold uppercase"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--color-bg-input)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-muted)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {fieldError && (
              <p className="text-xs font-medium text-red-500">{fieldError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Signing in...</>
              ) : (
                <><LogIn className="h-4 w-4" /> Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
            <span>OR CONTINUE WITH</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={() => {
              toast.info("Google Sign-In will be integrated in a future release.");
            }}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign In with Google
          </button>

          <div className="mt-6 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
