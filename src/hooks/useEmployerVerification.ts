"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { employerApi } from "@/services/employer.api";

export interface EmployerVerificationResult {
  loading: boolean;
  isVerified: boolean;
  verificationStatus: string;
  rejectionReason?: string;
  companyName?: string;
  verifyOrWarn: (callback?: () => void) => boolean;
}

export function useEmployerVerification(): EmployerVerificationResult {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("PENDING");
  const [rejectionReason, setRejectionReason] = useState<string | undefined>();
  const [companyName, setCompanyName] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;

    async function checkVerification() {
      if (!isAuthenticated || user?.role !== "EMPLOYER") {
        if (isMounted) {
          setIsVerified(false);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await employerApi.getProfile();
        if (isMounted && res?.success && res?.data?.company) {
          const comp = res.data.company;
          const status = String(comp.verificationStatus || "PENDING").toUpperCase();
          const verified = status === "APPROVED" || status === "VERIFIED";

          setIsVerified(verified);
          setVerificationStatus(status);
          setRejectionReason(comp.rejectionReason);
          setCompanyName(comp.name);
        }
      } catch (err) {
        console.error("Error checking employer verification status:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkVerification();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated]);

  const verifyOrWarn = (callback?: () => void): boolean => {
    if (loading) return false;

    if (!isVerified) {
      toast.warning(
        "Your company profile must be verified by an admin before you can post jobs."
      );
      return false;
    }

    if (callback) callback();
    return true;
  };

  return {
    loading,
    isVerified,
    verificationStatus,
    rejectionReason,
    companyName,
    verifyOrWarn,
  };
}
