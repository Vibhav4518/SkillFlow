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
  websiteUrl: string | null;
  logoUrl: string | null;
  location: string | null;
  verificationStatus: string | null;
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
