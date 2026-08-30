import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const authGuardMock = vi.fn();
const getMyProfileMock = vi.fn();
const dummyHandlerMock = vi.fn((_req: any, res: any) => res.status(200).json({ success: true }));

vi.mock("../../../middlewares/auth.middleware.js", () => ({
  authGuard: authGuardMock,
}));

vi.mock("../controllers/candidate.controller.js", () => ({
  candidateController: {
    getMyProfile: getMyProfileMock,
    getBasicProfile: dummyHandlerMock,
    updateBasicProfile: dummyHandlerMock,
    addEducation: dummyHandlerMock,
    getEducation: dummyHandlerMock,
    updateEducation: dummyHandlerMock,
    deleteEducation: dummyHandlerMock,
    addLanguage: dummyHandlerMock,
    getLanguages: dummyHandlerMock,
    updateLanguage: dummyHandlerMock,
    deleteLanguage: dummyHandlerMock,
    addExperience: dummyHandlerMock,
    getExperiences: dummyHandlerMock,
    updateExperience: dummyHandlerMock,
    deleteExperience: dummyHandlerMock,
    addProject: dummyHandlerMock,
    getProjects: dummyHandlerMock,
    updateProject: dummyHandlerMock,
    deleteProject: dummyHandlerMock,
    addCertification: dummyHandlerMock,
    getCertifications: dummyHandlerMock,
    updateCertification: dummyHandlerMock,
    deleteCertification: dummyHandlerMock,
    getCandidateSkills: dummyHandlerMock,
    assignCandidateSkills: dummyHandlerMock,
    deleteCandidateSkill: dummyHandlerMock,
    uploadResume: dummyHandlerMock,
    getResume: dummyHandlerMock,
    deleteResume: dummyHandlerMock,
    generateResumePdf: dummyHandlerMock,
    getCompleteProfile: dummyHandlerMock,
  },
}));

describe("CandidateRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    authGuardMock.mockImplementation((req: any, _res: any, next: any) => {
      req.user = {
        id: "11111111-1111-1111-1111-111111111111",
        email: "candidate@gmail.com",
        role: "candidate",
      };
      next();
    });

    getMyProfileMock.mockImplementation(async (_req: any, res: any) => {
      return res.status(200).json({
        success: true,
        data: {
          id: "22222222-2222-2222-2222-222222222222",
          name: "Avery Patel",
          email: "candidate@gmail.com",
          phone: "9876543210",
          location: "Lucknow",
          skills: ["JavaScript", "TypeScript"],
        },
      });
    });
  });

  it("should register GET /me route", async () => {
    const { candidateRouter } = await import("../routes/candidate.routes.js");
    const app = express();
    app.use("/api/v1/candidate", candidateRouter);

    const response = await request(app).get("/api/v1/candidate/me");

    expect(response.status).toBe(200);
    expect(authGuardMock).toHaveBeenCalledTimes(1);
    expect(getMyProfileMock).toHaveBeenCalledTimes(1);
  });

  it("should call authGuard before candidate controller", async () => {
    const callOrder: string[] = [];

    authGuardMock.mockImplementation((req: any, _res: any, next: any) => {
      callOrder.push("auth");
      req.user = {
        id: "11111111-1111-1111-1111-111111111111",
        email: "candidate@gmail.com",
        role: "candidate",
      };
      next();
    });

    getMyProfileMock.mockImplementation(async (_req: any, res: any) => {
      callOrder.push("controller");
      return res.status(200).json({ success: true });
    });

    const { candidateRouter } = await import("../routes/candidate.routes.js");
    const app = express();
    app.use("/api/v1/candidate", candidateRouter);

    await request(app).get("/api/v1/candidate/me");

    expect(callOrder).toEqual(["auth", "controller"]);
  });

  it("should pass authenticated request to controller", async () => {
    const userId = "11111111-1111-1111-1111-111111111111";

    authGuardMock.mockImplementation((req: any, _res: any, next: any) => {
      req.user = {
        id: userId,
        email: "candidate@gmail.com",
        role: "candidate",
      };
      next();
    });

    getMyProfileMock.mockImplementation(async (req: any, res: any) => {
      return res.status(200).json({ userId: req.user.id });
    });

    const { candidateRouter } = await import("../routes/candidate.routes.js");
    const app = express();
    app.use("/api/v1/candidate", candidateRouter);

    const response = await request(app).get("/api/v1/candidate/me");

    expect(getMyProfileMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.body.userId).toBe(userId);
  });

  it("should return candidate controller response", async () => {
    const expectedResponse = {
      success: true,
      data: {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Avery Patel",
        email: "candidate@gmail.com",
        phone: "9876543210",
        location: "Lucknow",
        skills: ["JavaScript", "TypeScript"],
      },
    };

    getMyProfileMock.mockImplementation(async (_req: any, res: any) => {
      return res.status(200).json(expectedResponse);
    });

    const { candidateRouter } = await import("../routes/candidate.routes.js");
    const app = express();
    app.use("/api/v1/candidate", candidateRouter);

    const response = await request(app).get("/api/v1/candidate/me");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponse);
  });

  it("should return 404 for unknown candidate route", async () => {
    const { candidateRouter } = await import("../routes/candidate.routes.js");
    const app = express();
    app.use("/api/v1/candidate", candidateRouter);

    const response = await request(app).get("/api/v1/candidate/unknown");

    expect(response.status).toBe(404);
  });

  it("should not allow POST /me", async () => {
    const { candidateRouter } = await import("../routes/candidate.routes.js");
    const app = express();
    app.use("/api/v1/candidate", candidateRouter);

    const response = await request(app).post("/api/v1/candidate/me");

    expect(response.status).toBe(404);
  });
});