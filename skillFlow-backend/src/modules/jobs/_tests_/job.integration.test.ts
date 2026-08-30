import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jobRouter from "../routes/job.route.js";
import { globalErrorHandler } from "../../../middlewares/error.middleware.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";

vi.mock("../../../infrastructure/database/lib/prisma.js", () => ({
  prisma: {
    job: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

const mockJob = {
  id: "e33e19fa-5fee-401b-bc24-14c44496e138",
  slug: "software-engineer-e33e19fa",
  title: "Software Engineer",
  jobType: "FULL_TIME",
  location: "Remote",
  salaryMin: 80000,
  salaryMax: 120000,
  description: "Job description",
  requirements: ["TypeScript"],
  responsibilities: ["API development"],
  status: "PUBLISHED",
  createdAt: new Date(),
  updatedAt: new Date(),
  company: {
    id: "cmp_1",
    name: "Tech Corp",
    logoUrl: "https://example.com/logo.png",
    location: "San Francisco",
  },
  category: {
    id: "cat_1",
    name: "Engineering",
  },
  skills: [
    {
      skill: {
        id: "sk_1",
        name: "TypeScript",
      },
    },
  ],
};

describe("Job API Integration Tests", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/jobs", jobRouter);
  app.use(globalErrorHandler);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/jobs", () => {
    it("should return all published jobs", async () => {
      vi.mocked(prisma.job.findMany).mockResolvedValue([mockJob] as any);

      const response = await request(app).get("/api/v1/jobs");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });
  });

  describe("GET /api/v1/jobs/:jobId", () => {
    it("should return 404 when job does not exist", async () => {
      vi.mocked(prisma.job.findFirst).mockResolvedValue(null);

      const response = await request(app).get("/api/v1/jobs/non-existing-job-id");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should return a job when job exists", async () => {
      vi.mocked(prisma.job.findFirst).mockResolvedValue(mockJob as any);

      const jobId = "e33e19fa-5fee-401b-bc24-14c44496e138";
      const response = await request(app).get(`/api/v1/jobs/${jobId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(jobId);
    });
  });
});


