export type UserRole = 'EMPLOYER' | 'CANDIDATE' | 'ADMIN';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
  companyId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RefreshTokenEntity {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}
