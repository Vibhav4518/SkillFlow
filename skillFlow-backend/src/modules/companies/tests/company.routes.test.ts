import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';

import request from 'supertest';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

/* -------------------------------------------------------------------------- */
/* Hoisted mocks                                                              */
/* -------------------------------------------------------------------------- */

const mocks = vi.hoisted(() => {
  const validationMiddleware = vi.fn(
    (
      _req: Request,
      _res: Response,
      next: NextFunction,
    ) => {
      next();
    },
  );

  return {
    authGuard: vi.fn(
      (
        _req: Request,
        _res: Response,
        next: NextFunction,
      ) => {
        next();
      },
    ),

    validate: vi.fn(() => validationMiddleware),

    validationMiddleware,

    getAllCompanies: vi.fn(),

    getCompanyById: vi.fn(),

    createCompany: vi.fn(),

    updateCompany: vi.fn(),

    updateVerificationStatus: vi.fn(),

    deleteCompany: vi.fn(),

    getCompanyEmployers: vi.fn(),

    addCompanyEmployer: vi.fn(),

    toggleEmployerStatus: vi.fn(),
  };
});

/* -------------------------------------------------------------------------- */
/* Mock auth middleware                                                       */
/* -------------------------------------------------------------------------- */

vi.mock(
  '../../../middlewares/auth.middleware.js',
  () => ({
    authGuard: mocks.authGuard,
  }),
);

/* -------------------------------------------------------------------------- */
/* Mock validation middleware                                                 */
/* -------------------------------------------------------------------------- */

vi.mock(
  '../../../middlewares/validation.middleware.js',
  () => ({
    validate: mocks.validate,
  }),
);

/* -------------------------------------------------------------------------- */
/* Mock controller                                                            */
/* -------------------------------------------------------------------------- */

vi.mock(
  '../controllers/company.controller.js',
  () => ({
    CompanyController: class {
      getAllCompanies = mocks.getAllCompanies;

      getCompanyById = mocks.getCompanyById;

      createCompany = mocks.createCompany;

      updateCompany = mocks.updateCompany;

      updateVerificationStatus =
        mocks.updateVerificationStatus;

      deleteCompany = mocks.deleteCompany;

      getCompanyEmployers = mocks.getCompanyEmployers;

      addCompanyEmployer = mocks.addCompanyEmployer;

      toggleEmployerStatus = mocks.toggleEmployerStatus;
    },
  }),
);

/* -------------------------------------------------------------------------- */
/* Import router after mocks                                                  */
/* -------------------------------------------------------------------------- */

import { companyRouter } from '../routes/company.routes.js';

/* -------------------------------------------------------------------------- */
/* Tests                                                                      */
/* -------------------------------------------------------------------------- */

describe('CompanyRoutes', () => {
  const companyId =
    '550e8400-e29b-41d4-a716-446655440000';

  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();

    /* ---------------------------------------------------------------------- */
    /* Restore auth middleware                                                */
    /* ---------------------------------------------------------------------- */

    mocks.authGuard.mockImplementation(
      (
        _req: Request,
        _res: Response,
        next: NextFunction,
      ) => {
        next();
      },
    );

    /* ---------------------------------------------------------------------- */
    /* Restore validation middleware                                          */
    /* ---------------------------------------------------------------------- */

    mocks.validationMiddleware.mockImplementation(
      (
        _req: Request,
        _res: Response,
        next: NextFunction,
      ) => {
        next();
      },
    );

    /* ---------------------------------------------------------------------- */
    /* Controller mock responses                                              */
    /* ---------------------------------------------------------------------- */

    mocks.getAllCompanies.mockImplementation(
      (_req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          message: 'Companies fetched successfully',
          data: [],
        });
      },
    );

    mocks.getCompanyById.mockImplementation(
      (_req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          message: 'Company fetched successfully',
          data: {
            id: companyId,
          },
        });
      },
    );

    mocks.createCompany.mockImplementation(
      (_req: Request, res: Response) => {
        res.status(201).json({
          success: true,
          message: 'Company created successfully',
        });
      },
    );

    mocks.updateCompany.mockImplementation(
      (_req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          message: 'Company updated successfully',
        });
      },
    );

    mocks.updateVerificationStatus.mockImplementation(
      (_req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          message:
            'Company verification status updated successfully',
        });
      },
    );

    mocks.deleteCompany.mockImplementation(
      (_req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          message: 'Company deleted successfully',
        });
      },
    );

    /* ---------------------------------------------------------------------- */
    /* Express app                                                            */
    /* ---------------------------------------------------------------------- */

    app = express();

    app.use(express.json());

    app.use(
      '/api/v1/companies',
      companyRouter,
    );
  });

  /* ------------------------------------------------------------------------ */
  /* GET /                                                                    */
  /* ------------------------------------------------------------------------ */

  it('should register GET / route', async () => {
    const response = await request(app)
      .get('/api/v1/companies');

    expect(response.status).toBe(200);

    expect(
      mocks.getAllCompanies,
    ).toHaveBeenCalledOnce();
  });

  /* ------------------------------------------------------------------------ */
  /* GET /:companyId                                                         */
  /* ------------------------------------------------------------------------ */

  it('should register GET /:companyId route', async () => {
    const response = await request(app)
      .get(`/api/v1/companies/${companyId}`);

    expect(response.status).toBe(200);

    expect(
      mocks.getCompanyById,
    ).toHaveBeenCalledOnce();
  });

  it('should execute validation middleware for GET /:companyId', async () => {
    const response = await request(app)
      .get(`/api/v1/companies/${companyId}`);

    expect(response.status).toBe(200);

    expect(
      mocks.validationMiddleware,
    ).toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------------ */
  /* POST /                                                                   */
  /* ------------------------------------------------------------------------ */

  it('should register POST / route', async () => {
    const response = await request(app)
      .post('/api/v1/companies')
      .set(
        'Authorization',
        'Bearer fake-access-token',
      )
      .send({
        name: 'HiLabs Technologies',
        websiteUrl: 'https://example.com',
      });

    expect(response.status).toBe(201);

    expect(
      mocks.authGuard,
    ).toHaveBeenCalledOnce();

    expect(
      mocks.createCompany,
    ).toHaveBeenCalledOnce();
  });

  it('should call authGuard before create company controller', async () => {
    const calls: string[] = [];

    mocks.authGuard.mockImplementationOnce(
      (
        _req: Request,
        _res: Response,
        next: NextFunction,
      ) => {
        calls.push('auth');

        next();
      },
    );

    mocks.createCompany.mockImplementationOnce(
      (_req: Request, res: Response) => {
        calls.push('controller');

        res.status(201).json({
          success: true,
        });
      },
    );

    const response = await request(app)
      .post('/api/v1/companies')
      .set(
        'Authorization',
        'Bearer fake-access-token',
      )
      .send({
        name: 'HiLabs Technologies',
      });

    expect(response.status).toBe(201);

    expect(calls).toEqual([
      'auth',
      'controller',
    ]);
  });

  it('should return 401 when authGuard rejects POST request', async () => {
    mocks.authGuard.mockImplementationOnce(
      (
        _req: Request,
        res: Response,
      ) => {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      },
    );

    const response = await request(app)
      .post('/api/v1/companies')
      .send({
        name: 'HiLabs Technologies',
      });

    expect(response.status).toBe(401);

    expect(
      mocks.createCompany,
    ).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------------ */
  /* PATCH /:companyId                                                       */
  /* ------------------------------------------------------------------------ */

  it('should register PATCH /:companyId route', async () => {
    const response = await request(app)
      .patch(
        `/api/v1/companies/${companyId}`,
      )
      .set(
        'Authorization',
        'Bearer fake-access-token',
      )
      .send({
        location: 'Bengaluru',
      });

    expect(response.status).toBe(200);

    expect(
      mocks.authGuard,
    ).toHaveBeenCalledOnce();

    expect(
      mocks.updateCompany,
    ).toHaveBeenCalledOnce();
  });

  it('should execute validation middleware for PATCH /:companyId', async () => {
    const response = await request(app)
      .patch(
        `/api/v1/companies/${companyId}`,
      )
      .set(
        'Authorization',
        'Bearer fake-access-token',
      )
      .send({
        location: 'Delhi',
      });

    expect(response.status).toBe(200);

    expect(
      mocks.validationMiddleware,
    ).toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------------ */
  /* PATCH /:companyId/verification                                          */
  /* ------------------------------------------------------------------------ */

  it('should register PATCH /:companyId/verification route', async () => {
    const response = await request(app)
      .patch(
        `/api/v1/companies/${companyId}/verification`,
      )
      .set(
        'Authorization',
        'Bearer fake-access-token',
      )
      .send({
        verificationStatus: 'verified',
      });

    expect(response.status).toBe(200);

    expect(
      mocks.authGuard,
    ).toHaveBeenCalledOnce();

    expect(
      mocks.updateVerificationStatus,
    ).toHaveBeenCalledOnce();
  });

  it('should execute validation middleware for verification route', async () => {
    const response = await request(app)
      .patch(
        `/api/v1/companies/${companyId}/verification`,
      )
      .set(
        'Authorization',
        'Bearer fake-access-token',
      )
      .send({
        verificationStatus: 'verified',
      });

    expect(response.status).toBe(200);

    expect(
      mocks.validationMiddleware,
    ).toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------------ */
  /* DELETE /:companyId                                                      */
  /* ------------------------------------------------------------------------ */

  it('should register DELETE /:companyId route', async () => {
    const response = await request(app)
      .delete(
        `/api/v1/companies/${companyId}`,
      )
      .set(
        'Authorization',
        'Bearer fake-access-token',
      );

    expect(response.status).toBe(200);

    expect(
      mocks.authGuard,
    ).toHaveBeenCalledOnce();

    expect(
      mocks.deleteCompany,
    ).toHaveBeenCalledOnce();
  });

  it('should return 401 when authGuard rejects DELETE request', async () => {
    mocks.authGuard.mockImplementationOnce(
      (
        _req: Request,
        res: Response,
      ) => {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      },
    );

    const response = await request(app)
      .delete(
        `/api/v1/companies/${companyId}`,
      );

    expect(response.status).toBe(401);

    expect(
      mocks.deleteCompany,
    ).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------------ */
  /* Wrong methods / unknown routes                                           */
  /* ------------------------------------------------------------------------ */

  it('should not allow PUT /:companyId', async () => {
    const response = await request(app)
      .put(
        `/api/v1/companies/${companyId}`,
      );

    expect(response.status).toBe(404);
  });

  it('should return 404 for unknown company route', async () => {
    const response = await request(app)
      .get(
        '/api/v1/companies/test/unknown/path',
      );

    expect(response.status).toBe(404);
  });
});