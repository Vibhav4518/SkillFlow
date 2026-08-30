import {
  CompanyRepository,
  ICompanyRepository,
} from "../repositories/company.repository.js";

import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  UpdateCompanyVerificationDTO,
} from "../dtos/company.dto.js";

import { CompanyEntity } from "../entities/company.entity.js";
import { notificationsService } from "../../notifications/notifications.service.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";

export interface ICompanyService {
  createCompany(dto: CreateCompanyDTO): Promise<CompanyEntity>;

  getCompanyById(companyId: string): Promise<CompanyEntity>;

  getAllCompanies(): Promise<CompanyEntity[]>;

  updateCompany(
    companyId: string,
    dto: UpdateCompanyDTO,
  ): Promise<CompanyEntity>;

  updateVerificationStatus(
    companyId: string,
    dto: UpdateCompanyVerificationDTO,
  ): Promise<CompanyEntity>;

  deleteCompany(companyId: string): Promise<void>;
}

export class CompanyService implements ICompanyService {
  constructor(
    private readonly companyRepository: ICompanyRepository = new CompanyRepository(),
  ) {}

  async createCompany(dto: CreateCompanyDTO): Promise<CompanyEntity> {
    const existingCompany = await this.companyRepository.findCompanyByName(
      dto.name,
    );

    if (existingCompany) {
      throw new Error("Company with this name already exists");
    }

    return this.companyRepository.createCompany(dto);
  }

  async getCompanyById(companyId: string): Promise<CompanyEntity> {
    const company = await this.companyRepository.findCompanyById(companyId);

    if (!company) {
      throw new Error("Company not found");
    }

    return company;
  }

  async getAllCompanies(): Promise<CompanyEntity[]> {
    return this.companyRepository.getAllCompanies();
  }

  async updateCompany(
    companyId: string,
    dto: UpdateCompanyDTO,
  ): Promise<CompanyEntity> {
    const existingCompany =
      await this.companyRepository.findCompanyById(companyId);

    if (!existingCompany) {
      throw new Error("Company not found");
    }

    if (
      dto.name &&
      dto.name.toLowerCase() !== existingCompany.name.toLowerCase()
    ) {
      const companyWithSameName =
        await this.companyRepository.findCompanyByName(dto.name);

      if (companyWithSameName) {
        throw new Error("Company with this name already exists");
      }
    }

    const updatedCompany = await this.companyRepository.updateCompany(
      companyId,
      dto,
    );

    if (!updatedCompany) {
      throw new Error("Failed to update company");
    }

    if (dto.verificationDocumentsUrl || dto.name || dto.industry) {
      notificationsService.notifyAdmins({
        type: "COMPANY_VERIFICATION_SUBMITTED",
        title: "Company Verification Submitted",
        message: `Employer updated credentials/details for company '${updatedCompany.name}' for verification.`,
        metadata: { companyId: updatedCompany.id, companyName: updatedCompany.name },
      }).catch(() => {});
    }

    return updatedCompany;
  }

  async updateVerificationStatus(
    companyId: string,
    dto: UpdateCompanyVerificationDTO,
  ): Promise<CompanyEntity> {
    const existingCompany =
      await this.companyRepository.findCompanyById(companyId);

    if (!existingCompany) {
      throw new Error("Company not found");
    }

    const updatedCompany =
      await this.companyRepository.updateVerificationStatus(
        companyId,
        dto.verificationStatus,
      );

    if (!updatedCompany) {
      throw new Error("Failed to update company verification status");
    }

    // Trigger notification to employer users of this company
    prisma.employerProfile.findMany({
      where: { companyId },
      select: { userId: true },
    }).then((employers) => {
      const statusStr = String(dto.verificationStatus).toUpperCase();
      for (const emp of employers) {
        notificationsService.createNotification({
          userId: emp.userId,
          type: "COMPANY_VERIFICATION_UPDATED",
          title: `Company Verification ${statusStr}`,
          message: `Your company '${existingCompany.name}' verification status is now ${statusStr}.`,
          metadata: { companyId, status: statusStr },
        }).catch(() => {});
      }
    }).catch(() => {});

    return updatedCompany;
  }

  async deleteCompany(companyId: string): Promise<void> {
    const existingCompany =
      await this.companyRepository.findCompanyById(companyId);

    if (!existingCompany) {
      throw new Error("Company not found");
    }

    const deleted = await this.companyRepository.deleteCompany(companyId);

    if (!deleted) {
      throw new Error("Failed to delete company");
    }
  }

  async addCompanyEmployer(
    requestingUserId: string,
    dto: { email: string; fullName: string; designation?: string; department?: string; phone?: string; password?: string }
  ): Promise<any> {
    const requester = await prisma.employerProfile.findUnique({
      where: { userId: requestingUserId },
      include: { company: true },
    });

    if (!requester || !requester.companyId) {
      throw new Error("You must be associated with a company to add employers.");
    }

    const compStatus = String(requester.company.verificationStatus).toUpperCase();
    if (compStatus !== "APPROVED" && compStatus !== "VERIFIED") {
      throw new Error("Company verification pending or unapproved. Employers can only be added after Admin approval.");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new Error("A user with this email address already exists.");
    }

    const PasswordHasher = (await import("../../../infrastructure/security/password-hasher.js")).PasswordHasher;
    const defaultPassword = dto.password || "SkillFlow123!";
    const passwordHash = await PasswordHasher.hash(defaultPassword);

    const newUser = await prisma.user.create({
      data: {
        id: (await import("node:crypto")).randomUUID(),
        email: dto.email.toLowerCase().trim(),
        fullName: dto.fullName.trim(),
        passwordHash,
        role: "EMPLOYER",
      },
    });

    const newProfile = await prisma.employerProfile.create({
      data: {
        id: (await import("node:crypto")).randomUUID(),
        userId: newUser.id,
        companyId: requester.companyId,
        designation: dto.designation || "Recruiter",
        department: dto.department || "HR / Talent",
        phone: dto.phone || null,
        isActive: true,
        isVerified: true,
      },
      include: { user: true, company: true },
    });

    return newProfile;
  }

  async getCompanyEmployers(requestingUserId: string): Promise<any[]> {
    const requester = await prisma.employerProfile.findUnique({
      where: { userId: requestingUserId },
    });

    if (!requester || !requester.companyId) {
      return [];
    }

    return prisma.employerProfile.findMany({
      where: { companyId: requester.companyId },
      include: {
        user: { select: { id: true, email: true, fullName: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async toggleEmployerStatus(requestingUserId: string, employerProfileId: string, isActive: boolean): Promise<any> {
    const requester = await prisma.employerProfile.findUnique({
      where: { userId: requestingUserId },
    });

    if (!requester || !requester.companyId) {
      throw new Error("Unauthorized request");
    }

    const targetEmployer = await prisma.employerProfile.findUnique({
      where: { id: employerProfileId },
    });

    if (!targetEmployer || targetEmployer.companyId !== requester.companyId) {
      throw new Error("Employer profile not found in your company");
    }

    return prisma.employerProfile.update({
      where: { id: employerProfileId },
      data: { isActive },
      include: { user: true },
    });
  }
}
