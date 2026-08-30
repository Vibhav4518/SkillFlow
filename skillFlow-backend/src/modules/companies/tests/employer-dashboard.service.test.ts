import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmployerDashboardService } from "../services/employer-dashboard.service.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";
import { ForbiddenError, UnauthorizedError } from "../../../errors/app.error.js";

vi.mock("../../../infrastructure/database/lib/prisma.js", () => ({
  prisma: {
    job: {
      count: vi.fn(),
    },
    jobApplication: {
      count: vi.fn(),
    },
    candidateProfile: {
      findMany: vi.fn(),
    },
  },
}));

describe("EmployerDashboardService", () => {
  let service: EmployerDashboardService;
  let mockEmployerRepo: any;
  let mockJobRepo: any;
  let mockAppRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEmployerRepo = {
      findByUserId: vi.fn(),
    };
    mockJobRepo = {
      findByCompanyId: vi.fn(),
    };
    mockAppRepo = {
      findEmployerApplications: vi.fn(),
    };

    service = new EmployerDashboardService(mockEmployerRepo, mockJobRepo, mockAppRepo);
  });

  describe("getDashboardStats", () => {
    it("should return company scoped statistics for authenticated employer", async () => {
      mockEmployerRepo.findByUserId.mockResolvedValue({
        id: "emp-1",
        userId: "user-1",
        companyId: "comp-1",
      });

      vi.mocked(prisma.job.count)
        .mockResolvedValueOnce(8) // totalJobs
        .mockResolvedValueOnce(4) // activeJobs (PUBLISHED)
        .mockResolvedValueOnce(2) // draftJobs (DRAFT)
        .mockResolvedValueOnce(2); // closedJobs (CLOSED)

      vi.mocked(prisma.jobApplication.count)
        .mockResolvedValueOnce(42) // totalApplications
        .mockResolvedValueOnce(15) // appliedApplications (APPLIED)
        .mockResolvedValueOnce(10) // inProgressApplications (IN_PROGRESS)
        .mockResolvedValueOnce(8) // shortlistedApplications (SHORTLISTED)
        .mockResolvedValueOnce(4) // interviewApplications (INTERVIEW)
        .mockResolvedValueOnce(5) // selectedApplications (SELECTED)
        .mockResolvedValueOnce(12) // rejectedApplications (REJECTED)
        .mockResolvedValueOnce(3); // withdrawnApplications (WITHDRAWN)

      const stats = await service.getDashboardStats("user-1");

      expect(stats).toEqual({
        totalJobs: 8,
        activeJobs: 4,
        publishedJobs: 4,
        draftJobs: 2,
        closedJobs: 2,
        totalApplications: 42,
        appliedApplications: 15,
        inProgressApplications: 10,
        shortlistedApplications: 8,
        interviewApplications: 4,
        selectedApplications: 5,
        rejectedApplications: 12,
        withdrawnApplications: 3,
      });
    });

    it("should throw UnauthorizedError if user id missing", async () => {
      await expect(service.getDashboardStats("")).rejects.toThrow(UnauthorizedError);
    });

    it("should throw ForbiddenError if employer profile not found", async () => {
      mockEmployerRepo.findByUserId.mockResolvedValue(null);

      await expect(service.getDashboardStats("user-unknown")).rejects.toThrow(ForbiddenError);
    });
  });

  describe("getEmployerJobs", () => {
    it("should return jobs for the employer company", async () => {
      mockEmployerRepo.findByUserId.mockResolvedValue({
        id: "emp-1",
        userId: "user-1",
        companyId: "comp-1",
      });

      const mockJobs = [
        {
          id: "job-1",
          title: "Backend Engineer",
          description: "Node.js",
          location: "Pune",
          workType: "REMOTE",
          jobType: "FULL_TIME",
          salaryMin: 500000,
          salaryMax: 1000000,
          status: "PUBLISHED",
          vacancies: 2,
          applicationDeadline: new Date(),
          publishedAt: new Date(),
          isPromoted: false,
          promotionType: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { applications: 5 },
        },
      ];

      mockJobRepo.findByCompanyId.mockResolvedValue(mockJobs);

      const result = await service.getEmployerJobs("user-1");

      expect(mockJobRepo.findByCompanyId).toHaveBeenCalledWith("comp-1", undefined);
      expect(result.length).toBe(1);
      expect(result[0].applicationCount).toBe(5);
    });
  });

  describe("getEmployerApplications", () => {
    it("should delegate to application repository with companyId", async () => {
      mockEmployerRepo.findByUserId.mockResolvedValue({
        id: "emp-1",
        userId: "user-1",
        companyId: "comp-1",
      });

      mockAppRepo.findEmployerApplications.mockResolvedValue([{ id: "app-1" }]);

      const result = await service.getEmployerApplications("user-1", { status: "APPLIED" });

      expect(mockAppRepo.findEmployerApplications).toHaveBeenCalledWith("comp-1", { status: "APPLIED" });
      expect(result.length).toBe(1);
    });
  });

  describe("searchCandidates", () => {
    it("should search candidates with filters and exclude private auth fields", async () => {
      mockEmployerRepo.findByUserId.mockResolvedValue({
        id: "emp-1",
        userId: "user-1",
        companyId: "comp-1",
      });

      const mockCandidates = [
        {
          id: "cand-1",
          userId: "user-c1",
          headline: "Fullstack Dev",
          summary: "Experienced",
          phone: "9876543210",
          location: "Bangalore",
          profilePhotoUrl: null,
          experienceYears: 3,
          preferredWorkType: "REMOTE",
          resumeUrl: null,
          linkedinUrl: null,
          githubUrl: null,
          portfolioUrl: null,
          user: { id: "user-c1", fullName: "Alice", email: "alice@example.com" },
          skills: [{ skill: { name: "TypeScript" } }],
          experiences: [],
          education: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.candidateProfile.findMany).mockResolvedValue(mockCandidates as any);

      const result = await service.searchCandidates("user-1", { skill: "TypeScript" });

      expect(result.length).toBe(1);
      expect(result[0].skills).toEqual(["TypeScript"]);
      expect(result[0].user.fullName).toBe("Alice");
    });
  });
});
