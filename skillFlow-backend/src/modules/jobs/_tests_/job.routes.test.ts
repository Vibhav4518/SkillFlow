import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// IMPORTANT:
// vi.hoisted() makes these mocks available before vi.mock() executes.
const { mockGetAllJobs, mockGetJobById } = vi.hoisted(() => ({
  mockGetAllJobs: vi.fn(),
  mockGetJobById: vi.fn(),
}));

// Mock JobController BEFORE importing the route
vi.mock("../controllers/job.controller.js", () => ({
  JobController: vi.fn().mockImplementation(() => ({
    getAllJobs: mockGetAllJobs,
    getJobById: mockGetJobById,
  })),
}));

import jobRouter from "../routes/job.route.js";

describe("Job Routes", () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();

    app.use(express.json());

    app.use("/api/v1/jobs", jobRouter);
  });

  // ============================================================
  // GET /api/v1/jobs
  // ============================================================

  it("GET / should call getAllJobs controller", async () => {
    mockGetAllJobs.mockImplementation(async (_req, res) => {
      return res.status(200).json({
        success: true,
        data: [],
      });
    });

    const response = await request(app)
      .get("/api/v1/jobs");

    expect(response.status).toBe(200);

    expect(mockGetAllJobs).toHaveBeenCalledTimes(1);
  });

  // ============================================================
  // GET /api/v1/jobs/:jobId
  // ============================================================

  it("GET /:jobId should call getJobById controller", async () => {
    mockGetJobById.mockImplementation(async (req, res) => {
      return res.status(200).json({
        success: true,
        data: {
          id: req.params.jobId,
        },
      });
    });

    const response = await request(app)
      .get("/api/v1/jobs/job-123");

    expect(response.status).toBe(200);

    expect(response.body.data.id).toBe("job-123");

    expect(mockGetJobById).toHaveBeenCalledTimes(1);
  });
});