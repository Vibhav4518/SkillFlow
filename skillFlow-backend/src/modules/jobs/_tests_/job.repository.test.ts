import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobRepository } from "../repositories/job.repository.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";

vi.mock("../../../infrastructure/database/lib/prisma.js", () => ({
  prisma: {
    job: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe("JobRepository", () => {
  let repository: JobRepository;

  beforeEach(() => {
    repository = new JobRepository();

    vi.clearAllMocks();
  });

  // ==========================================================
  // findAll()
  // ==========================================================

  describe("findAll()", () => {
    it("should return all published jobs", async () => {
      const mockJobs = [
        {
          id: "job-1",
          title: "Software Engineer",
          status: "PUBLISHED",
        },
        {
          id: "job-2",
          title: "Backend Developer",
          status: "PUBLISHED",
        },
      ];

      vi.mocked(prisma.job.findMany).mockResolvedValue(mockJobs as any);

      const result = await repository.findAll();

      expect(result).toEqual(mockJobs);

      expect(prisma.job.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array when no jobs exist", async () => {
      vi.mocked(prisma.job.findMany).mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);

      expect(prisma.job.findMany).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when database query fails", async () => {
      vi.mocked(prisma.job.findMany).mockRejectedValue(
        new Error("Database error")
      );

      await expect(repository.findAll()).rejects.toThrow("Database error");
    });
  });

  // ==========================================================
  // findById()
  // ==========================================================

  describe("findById()", () => {
    it("should return a job when job exists", async () => {
      const mockJob = {
        id: "job-1",
        title: "Software Engineer",
        status: "PUBLISHED",
      };

      vi.mocked(prisma.job.findFirst).mockResolvedValue(mockJob as any);

      const result = await repository.findById("job-1");

      expect(result).toEqual(mockJob);

      expect(prisma.job.findFirst).toHaveBeenCalledTimes(1);

      expect(prisma.job.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: "job-1",
          }),
        })
      );
    });

    it("should return null when job does not exist", async () => {
      vi.mocked(prisma.job.findFirst).mockResolvedValue(null);

      const result = await repository.findById("non-existing-id");

      expect(result).toBeNull();

      expect(prisma.job.findFirst).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when database query fails", async () => {
      vi.mocked(prisma.job.findFirst).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        repository.findById("job-1")
      ).rejects.toThrow("Database error");
    });
  });
});