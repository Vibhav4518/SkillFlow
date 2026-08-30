import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobService } from "../services/job.service.js";
import { JobRepository } from "../repositories/job.repository.js";
import { NotFoundError } from "../../../errors/app.error.js";

describe("JobService", () => {
  let jobService: JobService;

  const mockJobRepository = {
    findAll: vi.fn(),
    findById: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    jobService = new JobService(mockJobRepository as unknown as JobRepository);
  });

  // ============================================================
  // GET ALL JOBS
  // ============================================================

  describe("getAllJobs", () => {
    it("should return all published jobs", async () => {
      const mockJobs = [
        {
          id: "job-1",
          slug: "software-developer",
          title: "Software Developer",

          createdAt: new Date(),

          company: {
            id: "company-1",
            name: "Bauch, Schuppe and Schulist Co",
            logoUrl: "https://example.com/logo.png",
            location: "New York, USA",
          },

          category: {
            id: "category-1",
            name: "Technology",
          },

          jobSkills: [
            {
              skill: {
                id: "skill-1",
                name: "JavaScript",
              },
            },
            {
              skill: {
                id: "skill-2",
                name: "Node.js",
              },
            },
          ],
        },
      ];

      mockJobRepository.findAll.mockResolvedValue(mockJobs);

      const result = await jobService.getAllJobs();

      expect(mockJobRepository.findAll).toHaveBeenCalledTimes(1);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);

      expect(result[0]).toMatchObject({
        id: "job-1",
        slug: "software-developer",
        title: "Software Developer",
      });
    });
  });

  // ============================================================
  // GET JOB BY ID
  // ============================================================

  describe("getJobById", () => {
    it("should return a job when job exists", async () => {
      const mockJob = {
        id: "job-1",
        slug: "software-developer",
        title: "Software Developer",

        description: "Build scalable backend applications.",

        createdAt: new Date(),
        updatedAt: new Date(),

        company: {
          id: "company-1",
          name: "Bauch, Schuppe and Schulist Co",
          logoUrl: "https://example.com/logo.png",
          location: "New York, USA",
        },

        category: {
          id: "category-1",
          name: "Technology",
        },

        jobSkills: [
          {
            skill: {
              id: "skill-1",
              name: "JavaScript",
            },
          },
          {
            skill: {
              id: "skill-2",
              name: "Node.js",
            },
          },
        ],
      };

      mockJobRepository.findById.mockResolvedValue(mockJob);

      const result = await jobService.getJobById("job-1");

      expect(mockJobRepository.findById).toHaveBeenCalledWith("job-1");

      expect(result).toBeDefined();

      expect(result).toMatchObject({
        id: "job-1",
        slug: "software-developer",
        title: "Software Developer",
      });
    });

    // ==========================================================
    // JOB NOT FOUND
    // ==========================================================

    it("should throw NotFoundError when job does not exist", async () => {
      mockJobRepository.findById.mockResolvedValue(null);

      await expect(jobService.getJobById("non-existing-job")).rejects.toThrow(
        NotFoundError,
      );

      expect(mockJobRepository.findById).toHaveBeenCalledWith(
        "non-existing-job",
      );
    });
  });
});
