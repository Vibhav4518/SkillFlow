import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { CompanyService } from '../services/company.service.js';

import type { ICompanyRepository } from '../repositories/company.repository.js';

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

describe('CompanyService', () => {
  let service: CompanyService;

  let repository: {
    createCompany: ReturnType<typeof vi.fn>;
    findCompanyById: ReturnType<typeof vi.fn>;
    findCompanyByName: ReturnType<typeof vi.fn>;
    getAllCompanies: ReturnType<typeof vi.fn>;
    updateCompany: ReturnType<typeof vi.fn>;
    updateVerificationStatus: ReturnType<typeof vi.fn>;
    deleteCompany: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repository = {
      createCompany: vi.fn(),
      findCompanyById: vi.fn(),
      findCompanyByName: vi.fn(),
      getAllCompanies: vi.fn(),
      updateCompany: vi.fn(),
      updateVerificationStatus: vi.fn(),
      deleteCompany: vi.fn(),
    };

    service = new CompanyService(
      repository as unknown as ICompanyRepository,
    );
  });

  describe('createCompany', () => {
    it('should create company when name does not exist', async () => {
      repository.findCompanyByName.mockResolvedValue(
        null,
      );

      repository.createCompany.mockResolvedValue(
        mockCompany,
      );

      const result = await service.createCompany({
        name: 'HiLabs Technologies',
        websiteUrl: 'https://example.com',
      });

      expect(result).toEqual(mockCompany);

      expect(
        repository.findCompanyByName,
      ).toHaveBeenCalledWith(
        'HiLabs Technologies',
      );

      expect(
        repository.createCompany,
      ).toHaveBeenCalledOnce();
    });

    it('should reject duplicate company name', async () => {
      repository.findCompanyByName.mockResolvedValue(
        mockCompany,
      );

      await expect(
        service.createCompany({
          name: 'HiLabs Technologies',
        }),
      ).rejects.toThrow(
        'Company with this name already exists',
      );

      expect(
        repository.createCompany,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getCompanyById', () => {
    it('should return company when found', async () => {
      repository.findCompanyById.mockResolvedValue(
        mockCompany,
      );

      const result =
        await service.getCompanyById(companyId);

      expect(result).toEqual(mockCompany);
    });

    it('should throw when company does not exist', async () => {
      repository.findCompanyById.mockResolvedValue(
        null,
      );

      await expect(
        service.getCompanyById(companyId),
      ).rejects.toThrow('Company not found');
    });
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      repository.getAllCompanies.mockResolvedValue([
        mockCompany,
      ]);

      const result =
        await service.getAllCompanies();

      expect(result).toEqual([mockCompany]);
    });
  });

  describe('updateCompany', () => {
    it('should update existing company', async () => {
      repository.findCompanyById.mockResolvedValue(
        mockCompany,
      );

      const updatedCompany = {
        ...mockCompany,
        location: 'Bengaluru',
      };

      repository.updateCompany.mockResolvedValue(
        updatedCompany,
      );

      const result = await service.updateCompany(
        companyId,
        {
          location: 'Bengaluru',
        },
      );

      expect(result.location).toBe('Bengaluru');
    });

    it('should throw when company does not exist', async () => {
      repository.findCompanyById.mockResolvedValue(
        null,
      );

      await expect(
        service.updateCompany(companyId, {
          location: 'Bengaluru',
        }),
      ).rejects.toThrow('Company not found');
    });

    it('should reject duplicate updated company name', async () => {
      repository.findCompanyById.mockResolvedValue(
        mockCompany,
      );

      repository.findCompanyByName.mockResolvedValue({
        ...mockCompany,
        id: '660e8400-e29b-41d4-a716-446655440000',
        name: 'TechNova',
      });

      await expect(
        service.updateCompany(companyId, {
          name: 'TechNova',
        }),
      ).rejects.toThrow(
        'Company with this name already exists',
      );

      expect(
        repository.updateCompany,
      ).not.toHaveBeenCalled();
    });

    it('should throw when repository update fails', async () => {
      repository.findCompanyById.mockResolvedValue(
        mockCompany,
      );

      repository.updateCompany.mockResolvedValue(null);

      await expect(
        service.updateCompany(companyId, {
          location: 'Delhi',
        }),
      ).rejects.toThrow('Failed to update company');
    });
  });

  describe('updateVerificationStatus', () => {
    it('should verify existing company', async () => {
      repository.findCompanyById.mockResolvedValue(
        mockCompany,
      );

      repository.updateVerificationStatus.mockResolvedValue(
        {
          ...mockCompany,
          verificationStatus: 'verified',
        },
      );

      const result =
        await service.updateVerificationStatus(
          companyId,
          {
            verificationStatus: 'verified',
          },
        );

      expect(result.verificationStatus).toBe(
        'verified',
      );
    });

    it('should throw when company does not exist', async () => {
      repository.findCompanyById.mockResolvedValue(
        null,
      );

      await expect(
        service.updateVerificationStatus(
          companyId,
          {
            verificationStatus: 'verified',
          },
        ),
      ).rejects.toThrow('Company not found');
    });
  });

  describe('deleteCompany', () => {
    it('should delete existing company', async () => {
      repository.findCompanyById.mockResolvedValue(
        mockCompany,
      );

      repository.deleteCompany.mockResolvedValue(true);

      await expect(
        service.deleteCompany(companyId),
      ).resolves.toBeUndefined();

      expect(
        repository.deleteCompany,
      ).toHaveBeenCalledWith(companyId);
    });

    it('should throw when company does not exist', async () => {
      repository.findCompanyById.mockResolvedValue(
        null,
      );

      await expect(
        service.deleteCompany(companyId),
      ).rejects.toThrow('Company not found');
    });

    it('should throw when delete fails', async () => {
      repository.findCompanyById.mockResolvedValue(
        mockCompany,
      );

      repository.deleteCompany.mockResolvedValue(false);

      await expect(
        service.deleteCompany(companyId),
      ).rejects.toThrow(
        'Failed to delete company',
      );
    });
  });
});