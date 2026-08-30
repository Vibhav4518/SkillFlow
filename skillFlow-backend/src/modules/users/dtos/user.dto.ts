import type { Role } from "@prisma/client";

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
}

export interface UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}