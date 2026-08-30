"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && user?.role) {
      const userRole = user.role.toUpperCase();
      const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

      if (!normalizedAllowed.includes(userRole)) {
        if (normalizedAllowed.includes("ADMIN") && userRole !== "ADMIN") {
          toast.error("You are not authorized to access the admin portal.");
        } else {
          toast.error("Access denied. Insufficient permissions.");
        }

        if (userRole === "ADMIN") router.replace("/admin/dashboard");
        else if (userRole === "EMPLOYER") router.replace("/employer/dashboard");
        else router.replace("/candidate/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, toast]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-[70vh] flex-1 items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && user?.role) {
    const userRole = user.role.toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    if (!normalizedAllowed.includes(userRole)) return null;
  }

  return <>{children}</>;
}
