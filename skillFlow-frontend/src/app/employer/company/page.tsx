"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EmployerCompanyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employer/dashboard");
  }, [router]);

  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]}>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
      </div>
    </ProtectedRoute>
  );
}
