export interface CreateCompanyDTO {
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  description?: string;
  location?: string;
  companySize?: string;
  industry?: string;
  verificationDocumentsUrl?: string;
}

export interface UpdateCompanyDTO {
  name?: string;
  websiteUrl?: string;
  logoUrl?: string;
  description?: string;
  location?: string;
  companySize?: string;
  industry?: string;
  verificationDocumentsUrl?: string;
}

export interface UpdateCompanyVerificationDTO {
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'pending' | 'verified' | 'rejected';
}

export interface CompanyResponseDTO {
  id: string;
  name: string;

  websiteUrl: string | null;
  logoUrl: string | null;

  description: string | null;
  location: string | null;
  companySize: string | null;
  industry: string | null;
  verificationDocumentsUrl: string | null;

  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'pending' | 'verified' | 'rejected' | null;

  createdAt: Date | null;
  updatedAt: Date | null;
}