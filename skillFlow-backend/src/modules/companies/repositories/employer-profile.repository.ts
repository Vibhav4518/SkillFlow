import { prisma } from "../../../infrastructure/database/lib/prisma.js";
import type { CreateEmployerProfileDTO, UpdateEmployerProfileDTO } from "../dtos/employer-profile.dto.js";

export interface IEmployerProfileRepository {
  findByUserId(userId: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  create(userId: string, dto: CreateEmployerProfileDTO): Promise<any>;
  update(userId: string, dto: UpdateEmployerProfileDTO): Promise<any | null>;
  findWithCompanyAndUser(userId: string): Promise<any | null>;
  findCompanyByEmployer(userId: string): Promise<any | null>;
}

export class EmployerProfileRepository implements IEmployerProfileRepository {
  async findByUserId(userId: string) {
    return prisma.employerProfile.findUnique({
      where: { userId },
    });
  }

  async findById(id: string) {
    return prisma.employerProfile.findUnique({
      where: { id },
    });
  }

  async create(userId: string, dto: CreateEmployerProfileDTO) {
    return prisma.employerProfile.create({
      data: {
        userId,
        companyId: dto.companyId,
        designation: dto.designation || null,
        department: dto.department || null,
        phone: dto.phone || null,
        profilePhotoUrl: dto.profilePhotoUrl || null,
      },
    });
  }

  async update(userId: string, dto: UpdateEmployerProfileDTO) {
    return prisma.employerProfile.update({
      where: { userId },
      data: {
        ...(dto.designation !== undefined && { designation: dto.designation }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.profilePhotoUrl !== undefined && { profilePhotoUrl: dto.profilePhotoUrl }),
      },
    });
  }

  async findWithCompanyAndUser(userId: string) {
    return prisma.employerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            websiteUrl: true,
            logoUrl: true,
            description: true,
            location: true,
            companySize: true,
            verificationStatus: true,
          },
        },
      },
    });
  }

  async findCompanyByEmployer(userId: string) {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId },
      include: {
        company: true,
      },
    });
    return profile?.company || null;
  }
}
