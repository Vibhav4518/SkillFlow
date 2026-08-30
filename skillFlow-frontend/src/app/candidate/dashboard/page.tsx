"use client";

import CandidateProfileContent from "@/components/CandidateProfileContent";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CandidateDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["CANDIDATE"]}>
      <CandidateProfileContent />
    </ProtectedRoute>
  );
}
