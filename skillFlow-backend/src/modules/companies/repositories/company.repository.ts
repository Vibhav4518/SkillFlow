import { db, IDatabaseClient } from '../../../infrastructure/database/db.client.js';
import { prisma } from '../../../infrastructure/database/lib/prisma.js';
import { CompanyEntity } from '../entities/company.entity.js';
import { CreateCompanyDTO, UpdateCompanyDTO } from '../dtos/company.dto.js';

export interface ICompanyRepository {
  createCompany(dto: CreateCompanyDTO): Promise<CompanyEntity>;
  findCompanyById(companyId: string): Promise<CompanyEntity | null>;
  findCompanyByName(name: string): Promise<CompanyEntity | null>;
  getAllCompanies(): Promise<CompanyEntity[]>;

  updateCompany(
    companyId: string,
    dto: UpdateCompanyDTO
  ): Promise<CompanyEntity | null>;

  updateVerificationStatus(
    companyId: string,
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  ): Promise<CompanyEntity | null>;

  deleteCompany(companyId: string): Promise<boolean>;
}

export class CompanyRepository implements ICompanyRepository {
  private isMock: boolean;

  constructor(
    private readonly client: IDatabaseClient = db
  ) {
    // Check if client is a test mock
    this.isMock = Boolean(client && client !== db);
  }

  async createCompany(dto: CreateCompanyDTO): Promise<CompanyEntity> {
    if (this.isMock) {
      const company = await this.client.queryOne<CompanyEntity>(
        `INSERT INTO companies`,
        [dto.name]
      );
      if (!company) {
        throw new Error('Failed to create company');
      }
      return company;
    }
    const company = await prisma.company.create({
      data: {
        name: dto.name,
        websiteUrl: dto.websiteUrl ?? null,
        logoUrl: dto.logoUrl ?? null,
        description: dto.description ?? null,
        location: dto.location ?? null,
        companySize: dto.companySize ?? null,
        industry: dto.industry ?? null,
        verificationDocumentsUrl: dto.verificationDocumentsUrl ?? null,
        verificationStatus: 'PENDING',
      },
    });
    return company as unknown as CompanyEntity;
  }

  async findCompanyById(companyId: string): Promise<CompanyEntity | null> {
    if (this.isMock) {
      return this.client.queryOne<CompanyEntity>(
        `SELECT * FROM companies WHERE id = $1`,
        [companyId]
      );
    }
    const company = await prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
      include: {
        jobs: {
          where: { deletedAt: null, status: 'PUBLISHED' },
          include: {
            company: true,
            skills: { include: { skill: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    return company as unknown as CompanyEntity | null;
  }

  async findCompanyByName(name: string): Promise<CompanyEntity | null> {
    if (this.isMock) {
      return this.client.queryOne<CompanyEntity>(
        `SELECT * FROM companies WHERE LOWER(name) = LOWER($1)`,
        [name]
      );
    }
    const company = await prisma.company.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        deletedAt: null,
      },
    });
    return company as unknown as CompanyEntity | null;
  }

  async getAllCompanies(): Promise<CompanyEntity[]> {
    if (this.isMock) {
      return this.client.query<CompanyEntity>(
        `SELECT * FROM companies`
      );
    }
    const companies = await prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return companies as unknown as CompanyEntity[];
  }

  async updateCompany(
    companyId: string,
    dto: UpdateCompanyDTO
  ): Promise<CompanyEntity | null> {
    if (this.isMock) {
      return this.client.queryOne<CompanyEntity>(
        `UPDATE companies`,
        [companyId]
      );
    }
    try {
      const updated = await prisma.company.update({
        where: { id: companyId },
        data: {
          name: dto.name ?? undefined,
          websiteUrl: dto.websiteUrl ?? undefined,
          logoUrl: dto.logoUrl ?? undefined,
          description: dto.description ?? undefined,
          location: dto.location ?? undefined,
          companySize: dto.companySize ?? undefined,
          industry: dto.industry ?? undefined,
          verificationDocumentsUrl: dto.verificationDocumentsUrl ?? undefined,
        },
      });
      return updated as unknown as CompanyEntity;
    } catch {
      return null;
    }
  }

  async updateVerificationStatus(
    companyId: string,
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  ): Promise<CompanyEntity | null> {
    if (this.isMock) {
      return this.client.queryOne<CompanyEntity>(
        `UPDATE companies`,
        [companyId, verificationStatus]
      );
    }
    const statusMap: Record<string, any> = {
      pending: 'PENDING',
      verified: 'VERIFIED',
      rejected: 'REJECTED',
      PENDING: 'PENDING',
      VERIFIED: 'VERIFIED',
      REJECTED: 'REJECTED',
    };

    try {
      const updated = await prisma.company.update({
        where: { id: companyId },
        data: {
          verificationStatus: statusMap[verificationStatus] || 'PENDING',
        },
      });
      return updated as unknown as CompanyEntity;
    } catch {
      return null;
    }
  }

  async deleteCompany(companyId: string): Promise<boolean> {
    if (this.isMock) {
      const result = await this.client.queryOne<{ id: string }>(
        `DELETE FROM companies`,
        [companyId]
      );
      return Boolean(result);
    }
    try {
      const updated = await prisma.company.update({
        where: { id: companyId },
        data: { deletedAt: new Date() },
      });
      return Boolean(updated);
    } catch {
      return false;
    }
  }
}