export type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected';

export interface CompanyEntity {
  id: string;

  name: string;

  websiteUrl: string | null;
  logoUrl: string | null;

  description: string | null;
  location: string | null;
  companySize: string | null;

  verificationStatus: VerificationStatus | null;

  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}