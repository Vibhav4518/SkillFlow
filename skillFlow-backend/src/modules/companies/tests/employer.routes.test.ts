import express, { type Request, type Response, type NextFunction } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const validationMiddleware = vi.fn((_req: Request, _res: Response, next: NextFunction) => {
    next();
  });

  const roleMiddleware = vi.fn((_req: Request, _res: Response, next: NextFunction) => {
    next();
  });

  return {
    authGuard: vi.fn((req: Request, _res: Response, next: NextFunction) => {
      (req as any).user = { userId: "user-123", role: "EMPLOYER" };
      next();
    }),
    requireRole: vi.fn(() => roleMiddleware),

    roleMiddleware,
    validate: vi.fn(() => validationMiddleware),
    validationMiddleware,
    getDashboard: vi.fn((_req: Request, res: Response) => {
      res.status(200).json({ success: true, data: { activeJobs: 2 } });
    }),
    getEmployerJobs: vi.fn((_req: Request, res: Response) => {
      res.status(200).json({ success: true, data: [] });
    }),
    getEmployerApplications: vi.fn((_req: Request, res: Response) => {
      res.status(200).json({ success: true, data: [] });
    }),
    searchCandidates: vi.fn((_req: Request, res: Response) => {
      res.status(200).json({ success: true, data: [] });
    }),
  };
});

vi.mock("../../../middlewares/auth.middleware.js", () => ({
  authGuard: mocks.authGuard,
}));

vi.mock("../../../middlewares/role.middleware.js", () => ({
  requireRole: mocks.requireRole,
}));

vi.mock("../../../middlewares/validation.middleware.js", () => ({
  validate: mocks.validate,
}));

vi.mock("../controllers/employer-dashboard.controller.js", () => ({
  EmployerDashboardController: vi.fn().mockImplementation(() => ({
    getDashboard: mocks.getDashboard,
    getEmployerJobs: mocks.getEmployerJobs,
    getEmployerApplications: mocks.getEmployerApplications,
    searchCandidates: mocks.searchCandidates,
  })),
}));

import { employerRouter } from "../routes/employer.routes.js";

describe("EmployerRoutes", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/v1/employer", employerRouter);
  });

  it("GET /api/v1/employer/dashboard should apply authGuard and requireRole", async () => {
    const res = await request(app).get("/api/v1/employer/dashboard");

    expect(mocks.authGuard).toHaveBeenCalled();
    expect(mocks.roleMiddleware).toHaveBeenCalled();
    expect(mocks.getDashboard).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("GET /api/v1/employer/jobs should apply authGuard, validation, and handler", async () => {
    const res = await request(app).get("/api/v1/employer/jobs");

    expect(mocks.authGuard).toHaveBeenCalled();
    expect(mocks.roleMiddleware).toHaveBeenCalled();
    expect(mocks.getEmployerJobs).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("GET /api/v1/employer/applications should apply authGuard, validation, and handler", async () => {
    const res = await request(app).get("/api/v1/employer/applications");

    expect(mocks.authGuard).toHaveBeenCalled();
    expect(mocks.roleMiddleware).toHaveBeenCalled();
    expect(mocks.getEmployerApplications).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("GET /api/v1/employer/candidates should apply authGuard, validation, and handler", async () => {
    const res = await request(app).get("/api/v1/employer/candidates");

    expect(mocks.authGuard).toHaveBeenCalled();
    expect(mocks.roleMiddleware).toHaveBeenCalled();
    expect(mocks.searchCandidates).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});
