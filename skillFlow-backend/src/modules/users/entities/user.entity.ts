import type { Role } from "@prisma/client";

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}