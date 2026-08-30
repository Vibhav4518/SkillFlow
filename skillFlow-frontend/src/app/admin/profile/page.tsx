"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

function AdminProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-purple-600 border-t-transparent" />
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminProfileRedirect />
    </ProtectedRoute>
  );
}
