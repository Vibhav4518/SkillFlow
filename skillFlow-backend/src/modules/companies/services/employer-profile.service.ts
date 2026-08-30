import { prisma } from "../../../infrastructure/database/lib/prisma.js";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../../errors/app.error.js";
import { EmployerProfileRepository, type IEmployerProfileRepository } from "../repositories/employer-profile.repository.js";
import { CompanyRepository, type ICompanyRepository } from "../repositories/company.repository.js";
import type {
  CreateEmployerProfileDTO,
  UpdateEmployerProfileDTO,
  EmployerProfileResponseDTO,
} from "../dtos/employer-profile.dto.js";

export interface IEmployerProfileService {
  createEmployerProfile(userId: string, dto: CreateEmployerProfileDTO): Promise<EmployerProfileResponseDTO>;
  getProfileByUserId(userId: string): Promise<EmployerProfileResponseDTO>;
  updateEmployerProfile(userId: string, dto: UpdateEmployerProfileDTO): Promise<EmployerProfileResponseDTO>;
}

export class EmployerProfileService implements IEmployerProfileService {
  constructor(
    private readonly employerProfileRepository: IEmployerProfileRepository = new EmployerProfileRepository(),
    private readonly companyRepository: ICompanyRepository = new CompanyRepository(),
  ) {}

  async createEmployerProfile(userId: string, dto: CreateEmployerProfileDTO): Promise<EmployerProfileResponseDTO> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role !== "EMPLOYER") {
      throw new ForbiddenError("Only users with EMPLOYER role can create an employer profile");
    }

    const existingProfile = await this.employerProfileRepository.findByUserId(userId);
    if (existingProfile) {
      throw new ConflictError("Employer profile already exists for this user");
    }

    const company = await this.companyRepository.findCompanyById(dto.companyId);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    const created = await this.employerProfileRepository.create(userId, dto);

    return {
      id: created.id,
      userId: created.userId,
      companyId: created.companyId,
      designation: created.designation,
      department: created.department,
      phone: created.phone,
      profilePhotoUrl: created.profilePhotoUrl,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      company: {
        id: company.id,
        name: company.name,
        websiteUrl: company.websiteUrl,
        logoUrl: company.logoUrl,
        location: company.location,
        verificationStatus: company.verificationStatus,
      },
    };
  }

  async getProfileByUserId(userId: string): Promise<EmployerProfileResponseDTO> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const profile = await this.employerProfileRepository.findWithCompanyAndUser(userId);
    if (!profile) {
      throw new NotFoundError("Employer profile not found");
    }

    return {
      id: profile.id,
      userId: profile.userId,
      companyId: profile.companyId,
      designation: profile.designation,
      department: profile.department,
      phone: profile.phone,
      profilePhotoUrl: profile.profilePhotoUrl,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: profile.user
        ? {
            id: profile.user.id,
            email: profile.user.email,
            fullName: profile.user.fullName,
            role: profile.user.role,
          }
        : undefined,
      company: profile.company
        ? {
            id: profile.company.id,
            name: profile.company.name,
            websiteUrl: profile.company.websiteUrl,
            logoUrl: profile.company.logoUrl,
            location: profile.company.location,
            verificationStatus: profile.company.verificationStatus,
          }
        : undefined,
    };
  }

  async updateEmployerProfile(userId: string, dto: UpdateEmployerProfileDTO): Promise<EmployerProfileResponseDTO> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const existingProfile = await this.employerProfileRepository.findByUserId(userId);
    if (!existingProfile) {
      throw new NotFoundError("Employer profile not found");
    }

    await this.employerProfileRepository.update(userId, dto);
    return this.getProfileByUserId(userId);
  }
}
