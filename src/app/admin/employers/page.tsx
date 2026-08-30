"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminEmployersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/companies");
  }, [router]);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
      </div>
    </ProtectedRoute>
  );
}
