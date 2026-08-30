import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobController } from "../controllers/job.controller.js";
import { NotFoundError } from "../../../errors/app.error.js";

describe("JobController (Unit Tests)", () => {
  let controller: JobController;

  const mockJobService = {
    getAllJobs: vi.fn(),
    getJobById: vi.fn(),
  };

  const mockRequest = {
    params: {},
    query: {},
  } as any;

  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;

  const mockNext = vi.fn();    // Mock Express NextFunction

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new JobController(mockJobService as any);
  });

  // ==========================================================
  // GET ALL JOBS
  // ==========================================================

  describe("getAllJobs()", () => {
    it("should return all jobs successfully", async () => {
      const jobs = [
        {
          id: "job-1",
          title: "Backend Developer",
          status: "PUBLISHED",
        },
        {
          id: "job-2",
          title: "Frontend Developer",
          status: "PUBLISHED",
        },
      ];

      mockJobService.getAllJobs.mockResolvedValue(jobs);

      await controller.getAllJobs(mockRequest, mockResponse, mockNext);

      expect(mockJobService.getAllJobs).toHaveBeenCalledTimes(1);

      expect(mockResponse.status).toHaveBeenCalledWith(200);

      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  // GET JOB BY ID

  describe("getJobById()", () => {
    it("should return a job successfully", async () => {
      const job = {
        id: "job-1",
        title: "Backend Developer",
        status: "PUBLISHED",
      };

      mockJobService.getJobById.mockResolvedValue(job);

      const request = {
        params: {
          jobId: "job-1",
        },
      } as any;

      await controller.getJobById(request, mockResponse, mockNext);

      expect(mockJobService.getJobById).toHaveBeenCalledWith("job-1");

      expect(mockResponse.status).toHaveBeenCalledWith(200);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    // ========================================================
    // JOB NOT FOUND
    // ========================================================

    
    it("should pass NotFoundError to next when job does not exist", async () => {
      const error = new NotFoundError("Job not found");

      mockJobService.getJobById.mockRejectedValue(error);

      const request = {
        params: {
          jobId: "non-existing-job",
        },
      } as any;

      await controller.getJobById(request, mockResponse, mockNext);

      expect(mockJobService.getJobById).toHaveBeenCalledWith(
        "non-existing-job",
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

