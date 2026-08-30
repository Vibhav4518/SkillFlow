export interface JobApplicationResponseDto {
  id: string;
  jobId: string;
  candidateId: string;
  resume?: string | null;
  coverLetter?: string | null;
  status: string;
  appliedDate: Date;
  statusUpdatedAt?: Date | null;
  withdrawnAt?: Date | null;
  updatedAt?: Date;
  job?: {
    id: string;
    title: string;
    companyId: string;
    location: string | null;
    status: string;
    company?: {
      id: string;
      name: string;
      logoUrl: string | null;
    };
  };
  candidate?: {
    id: string;
    userId: string;
    headline: string | null;
    phone: string | null;
    location: string | null;
    profilePhotoUrl: string | null;
    user?: {
      id: string;
      fullName: string;
      email: string;
    };
  };
}

