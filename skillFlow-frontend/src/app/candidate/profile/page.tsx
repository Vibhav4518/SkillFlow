"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import CandidateProfileContent from "@/components/CandidateProfileContent";

export default function CandidateProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["CANDIDATE"]}>
      <CandidateProfileContent />
    </ProtectedRoute>
  );
}
