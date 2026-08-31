export type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected';

export interface CompanyEntity {
  id: string;

  name: string;
  industry?: string | null;

  websiteUrl: string | null;
  logoUrl: string | null;

  description: string | null;
  location: string | null;
  companySize: string | null;
  verificationDocumentsUrl?: string | null;

  verificationStatus: VerificationStatus | string | null;
  rejectionReason?: string | null;

  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}