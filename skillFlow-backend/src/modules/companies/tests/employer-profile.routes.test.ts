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
    createProfile: vi.fn((_req: Request, res: Response) => {
      res.status(201).json({ success: true, data: { id: "profile-123" } });
    }),
    getMyProfile: vi.fn((_req: Request, res: Response) => {
      res.status(200).json({ success: true, data: { id: "profile-123" } });
    }),
    updateMyProfile: vi.fn((_req: Request, res: Response) => {
      res.status(200).json({ success: true, data: { id: "profile-123" } });
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

vi.mock("../controllers/employer-profile.controller.js", () => ({
  EmployerProfileController: vi.fn().mockImplementation(() => ({
    createProfile: mocks.createProfile,
    getMyProfile: mocks.getMyProfile,
    updateMyProfile: mocks.updateMyProfile,
  })),
}));

import { employerProfileRouter } from "../routes/employer-profile.routes.js";

describe("EmployerProfileRoutes", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/v1/employer-profile", employerProfileRouter);
  });

  it("POST /api/v1/employer-profile should apply authGuard, requireRole, validation, and handler", async () => {
    const res = await request(app)
      .post("/api/v1/employer-profile")
      .send({ companyId: "550e8400-e29b-41d4-a716-446655440000" });

    expect(mocks.authGuard).toHaveBeenCalled();
    expect(mocks.roleMiddleware).toHaveBeenCalled();
    expect(mocks.createProfile).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  it("GET /api/v1/employer-profile/me should apply authGuard, requireRole, and handler", async () => {
    const res = await request(app).get("/api/v1/employer-profile/me");

    expect(mocks.authGuard).toHaveBeenCalled();
    expect(mocks.roleMiddleware).toHaveBeenCalled();
    expect(mocks.getMyProfile).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("PATCH /api/v1/employer-profile/me should apply authGuard, requireRole, validation, and handler", async () => {
    const res = await request(app)
      .patch("/api/v1/employer-profile/me")
      .send({ designation: "VP Talent" });

    expect(mocks.authGuard).toHaveBeenCalled();
    expect(mocks.roleMiddleware).toHaveBeenCalled();
    expect(mocks.updateMyProfile).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});
