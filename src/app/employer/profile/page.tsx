"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

function EmployerProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employer/company");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
    </div>
  );
}

export default function EmployerProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]}>
      <EmployerProfileRedirect />
    </ProtectedRoute>
  );
}
