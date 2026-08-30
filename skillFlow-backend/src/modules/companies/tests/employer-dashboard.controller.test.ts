import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmployerDashboardController } from "../controllers/employer-dashboard.controller.js";

describe("EmployerDashboardController", () => {
  let controller: EmployerDashboardController;
  let mockService: any;
  let mockRes: any;
  let next: any;

  beforeEach(() => {
    mockService = {
      getDashboardStats: vi.fn(),
      getEmployerJobs: vi.fn(),
      getEmployerApplications: vi.fn(),
      searchCandidates: vi.fn(),
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();

    controller = new EmployerDashboardController(mockService);
  });

  it("getDashboard should return 200 and stats data", async () => {
    const stats = { activeJobs: 4, totalJobs: 8, totalApplications: 42 };
    mockService.getDashboardStats.mockResolvedValue(stats);

    const req: any = { user: { userId: "user-123" } };
    await controller.getDashboard(req, mockRes, next);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: stats });
  });

  it("getEmployerJobs should return 200 and jobs data", async () => {
    const jobs = [{ id: "job-1", title: "Dev" }];
    mockService.getEmployerJobs.mockResolvedValue(jobs);

    const req: any = { user: { userId: "user-123" }, query: {} };
    await controller.getEmployerJobs(req, mockRes, next);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: jobs });
  });

  it("getEmployerApplications should return 200 and applications data", async () => {
    const apps = [{ id: "app-1" }];
    mockService.getEmployerApplications.mockResolvedValue(apps);

    const req: any = { user: { userId: "user-123" }, query: {} };
    await controller.getEmployerApplications(req, mockRes, next);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: apps });
  });

  it("searchCandidates should return 200 and candidates data", async () => {
    const candidates = [{ id: "cand-1", skills: ["Node.js"] }];
    mockService.searchCandidates.mockResolvedValue(candidates);

    const req: any = { user: { userId: "user-123" }, query: { skill: "Node.js" } };
    await controller.searchCandidates(req, mockRes, next);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: candidates });
  });
});
