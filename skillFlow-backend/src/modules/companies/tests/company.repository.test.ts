import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { CompanyRepository } from '../repositories/company.repository.js';

import type { IDatabaseClient } from '../../../infrastructure/database/db.client.js';

const companyId =
  '550e8400-e29b-41d4-a716-446655440000';

const mockCompany = {
  id: companyId,
  name: 'HiLabs Technologies',
  websiteUrl: 'https://example.com',
  logoUrl: 'https://example.com/logo.png',
  description: 'Healthcare technology company',
  location: 'Pune',
  companySize: '100-500',
  verificationStatus: 'pending' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('CompanyRepository', () => {
  let repository: CompanyRepository;

  let mockDatabaseClient: {
    queryOne: ReturnType<typeof vi.fn>;
    query: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDatabaseClient = {
      queryOne: vi.fn(),
      query: vi.fn(),
    };

    repository = new CompanyRepository(
      mockDatabaseClient as unknown as IDatabaseClient,
    );
  });

  describe('createCompany', () => {
    it('should create and return company', async () => {
      mockDatabaseClient.queryOne.mockResolvedValue(
        mockCompany,
      );

      const result = await repository.createCompany({
        name: 'HiLabs Technologies',
        websiteUrl: 'https://example.com',
        logoUrl: 'https://example.com/logo.png',
        description: 'Healthcare technology company',
        location: 'Pune',
        companySize: '100-500',
      });

      expect(result).toEqual(mockCompany);

      expect(
        mockDatabaseClient.queryOne,
      ).toHaveBeenCalledOnce();
    });

    it('should throw when company creation fails', async () => {
      mockDatabaseClient.queryOne.mockResolvedValue(null);

      await expect(
        repository.createCompany({
          name: 'HiLabs Technologies',
        }),
      ).rejects.toThrow('Failed to create company');
    });
  });

  describe('findCompanyById', () => {
    it('should return company when company exists', async () => {
      mockDatabaseClient.queryOne.mockResolvedValue(
        mockCompany,
      );

      const result =
        await repository.findCompanyById(companyId);

      expect(result).toEqual(mockCompany);
    });

    it('should return null when company does not exist', async () => {
      mockDatabaseClient.queryOne.mockResolvedValue(null);

      const result =
        await repository.findCompanyById(companyId);

      expect(result).toBeNull();
    });
  });

  describe('findCompanyByName', () => {
    it('should return company by name', async () => {
      mockDatabaseClient.queryOne.mockResolvedValue(
        mockCompany,
      );

      const result =
        await repository.findCompanyByName(
          'HiLabs Technologies',
        );

      expect(result).toEqual(mockCompany);
    });
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      mockDatabaseClient.query.mockResolvedValue([
        mockCompany,
      ]);

      const result =
        await repository.getAllCompanies();

      expect(result).toEqual([mockCompany]);
    });

    it('should return empty array when no companies exist', async () => {
      mockDatabaseClient.query.mockResolvedValue([]);

      const result =
        await repository.getAllCompanies();

      expect(result).toEqual([]);
    });
  });

  describe('updateCompany', () => {
    it('should update company', async () => {
      const updatedCompany = {
        ...mockCompany,
        location: 'Bengaluru',
      };

      mockDatabaseClient.queryOne.mockResolvedValue(
        updatedCompany,
      );

      const result =
        await repository.updateCompany(companyId, {
          location: 'Bengaluru',
        });

      expect(result).toEqual(updatedCompany);
    });
  });

  describe('updateVerificationStatus', () => {
    it('should update verification status', async () => {
      const verifiedCompany = {
        ...mockCompany,
        verificationStatus: 'verified' as const,
      };

      mockDatabaseClient.queryOne.mockResolvedValue(
        verifiedCompany,
      );

      const result =
        await repository.updateVerificationStatus(
          companyId,
          'verified',
        );

      expect(result).not.toBeNull();
expect(result?.verificationStatus).toBe('verified');
    });
  });

  describe('deleteCompany', () => {
    it('should return true when company is soft deleted', async () => {
      mockDatabaseClient.queryOne.mockResolvedValue({
        id: companyId,
      });

      const result =
        await repository.deleteCompany(companyId);

      expect(result).toBe(true);
    });

    it('should return false when company does not exist', async () => {
      mockDatabaseClient.queryOne.mockResolvedValue(null);

      const result =
        await repository.deleteCompany(companyId);

      expect(result).toBe(false);
    });
  });
});