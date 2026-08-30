"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const role = (user.role || "").toUpperCase();
      if (role === "ADMIN") router.replace("/admin/dashboard");
      else if (role === "EMPLOYER") router.replace("/employer/dashboard");
      else router.replace("/candidate/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardRedirect />
    </ProtectedRoute>
  );
}
