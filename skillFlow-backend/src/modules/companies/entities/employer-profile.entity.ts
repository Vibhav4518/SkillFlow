export interface EmployerProfileEntity {
  id: string;
  userId: string;
  companyId: string;
  designation: string | null;
  department: string | null;
  phone: string | null;
  profilePhotoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
