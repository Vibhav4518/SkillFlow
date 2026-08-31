export interface CreateEmployerProfileDTO {
  companyId: string;
  designation?: string;
  department?: string;
  phone?: string;
  profilePhotoUrl?: string;
}

export interface UpdateEmployerProfileDTO {
  designation?: string;
  department?: string;
  phone?: string;
  profilePhotoUrl?: string;
}

export interface EmployerProfileUserDTO {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface EmployerProfileCompanyDTO {
  id: string;
  name: string;
  industry?: string | null;
  companySize?: string | null;
  description?: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  location: string | null;
  verificationDocumentsUrl?: string | null;
  verificationStatus: string | null;
  rejectionReason?: string | null;
}

export interface EmployerProfileResponseDTO {
  id: string;
  userId: string;
  companyId: string;
  designation: string | null;
  department: string | null;
  phone: string | null;
  profilePhotoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: EmployerProfileUserDTO;
  company?: EmployerProfileCompanyDTO;
}
