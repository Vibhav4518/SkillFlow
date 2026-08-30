import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  Request,
  Response,
  NextFunction,
} from 'express';

import { CompanyController } from '../controllers/company.controller.js';

import type { ICompanyService } from '../services/company.service.js';

const companyId =
  '550e8400-e29b-41d4-a716-446655440000';

const mockCompany = {
  id: companyId,
  name: 'HiLabs Technologies',
  websiteUrl: 'https://example.com',
  logoUrl: null,
  description: null,
  location: 'Pune',
  companySize: '100-500',
  verificationStatus: 'pending' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('CompanyController', () => {
  let controller: CompanyController;

  let service: {
    createCompany: ReturnType<typeof vi.fn>;
    getCompanyById: ReturnType<typeof vi.fn>;
    getAllCompanies: ReturnType<typeof vi.fn>;
    updateCompany: ReturnType<typeof vi.fn>;
    updateVerificationStatus: ReturnType<typeof vi.fn>;
    deleteCompany: ReturnType<typeof vi.fn>;
  };

  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    service = {
      createCompany: vi.fn(),
      getCompanyById: vi.fn(),
      getAllCompanies: vi.fn(),
      updateCompany: vi.fn(),
      updateVerificationStatus: vi.fn(),
      deleteCompany: vi.fn(),
    };

    controller = new CompanyController(
      service as unknown as ICompanyService,
    );

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();
  });

  it('should create company and return 201', async () => {
    const req = {
      body: {
        name: 'HiLabs Technologies',
      },
    } as Request;

    service.createCompany.mockResolvedValue(
      mockCompany,
    );

    await controller.createCompany(
      req,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Company created successfully',
      data: mockCompany,
    });
  });

  it('should get company by id', async () => {
    const req = {
      params: {
        companyId,
      },
    } as any;

    service.getCompanyById.mockResolvedValue(
      mockCompany,
    );

    await controller.getCompanyById(
      req,
      res as Response,
      next,
    );

    expect(
      service.getCompanyById,
    ).toHaveBeenCalledWith(companyId);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return all companies', async () => {
    const req = {} as Request;

    service.getAllCompanies.mockResolvedValue([
      mockCompany,
    ]);

    await controller.getAllCompanies(
      req,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Companies fetched successfully',
      data: [mockCompany],
    });
  });

  it('should update company', async () => {
    const req = {
      params: {
        companyId,
      },
      body: {
        location: 'Bengaluru',
      },
    } as any;

    const updatedCompany = {
      ...mockCompany,
      location: 'Bengaluru',
    };

    service.updateCompany.mockResolvedValue(
      updatedCompany,
    );

    await controller.updateCompany(
      req,
      res as Response,
      next,
    );

    expect(
      service.updateCompany,
    ).toHaveBeenCalledWith(
      companyId,
      {
        location: 'Bengaluru',
      },
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should update verification status', async () => {
    const req = {
      params: {
        companyId,
      },
      body: {
        verificationStatus: 'verified',
      },
    } as any;

    const verifiedCompany = {
      ...mockCompany,
      verificationStatus: 'verified',
    };

    service.updateVerificationStatus.mockResolvedValue(
      verifiedCompany,
    );

    await controller.updateVerificationStatus(
      req,
      res as Response,
      next,
    );

    expect(
      service.updateVerificationStatus,
    ).toHaveBeenCalledWith(
      companyId,
      {
        verificationStatus: 'verified',
      },
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should delete company', async () => {
    const req = {
      params: {
        companyId,
      },
    } as any;

    service.deleteCompany.mockResolvedValue(
      undefined,
    );

    await controller.deleteCompany(
      req,
      res as Response,
      next,
    );

    expect(
      service.deleteCompany,
    ).toHaveBeenCalledWith(companyId);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Company deleted successfully',
      data: null,
    });
  });

  it('should pass service error to next()', async () => {
    const req = {
      body: {
        name: 'HiLabs Technologies',
      },
    } as Request;

    const error = new Error(
      'Company with this name already exists',
    );

    service.createCompany.mockRejectedValue(error);

    await controller.createCompany(
      req,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});