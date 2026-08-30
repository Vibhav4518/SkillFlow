import { describe, expect, it, vi, beforeEach } from "vitest";
import { JobApplicationService } from "../services/job-application.service.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from "../../../errors/app.error.js";



vi.mock("../../../infrastructure/database/lib/prisma.js", () => ({
  prisma: {
    candidateProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    employerProfile: {
      findUnique: vi.fn(),
    },
    job: {
      findUnique: vi.fn(),
    },
    jobApplication: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("JobApplicationService - Advanced & Scoping Rules", () => {
  let service: JobApplicationService;
  let mockRepo: any;

  const candidateUser = { userId: "user-cand-1", role: "CANDIDATE" };
  const candidateProfile = { id: "cand-profile-1", userId: "user-cand-1" };

  const employerUser = { userId: "user-emp-1", role: "EMPLOYER" };
  const employerProfile = { id: "emp-profile-1", userId: "user-emp-1", companyId: "comp-1" };

  const otherEmployerUser = { userId: "user-emp-2", role: "EMPLOYER" };
  const otherEmployerProfile = { id: "emp-profile-2", userId: "user-emp-2", companyId: "comp-OTHER" };

  const publishedJob = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    companyId: "comp-1",
    status: "PUBLISHED",
    applicationDeadline: new Date(Date.now() + 86400000),
    deletedAt: null,
  };

  const sampleApp = {
    id: "app-123",
    jobId: publishedJob.id,
    candidateId: candidateProfile.id,
    status: "APPLIED",
    job: { companyId: "comp-1" },
    appliedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      findRawById: vi.fn(),
      findByJobAndCandidate: vi.fn(),
      findCandidateApplications: vi.fn(),
      findEmployerApplications: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      withdraw: vi.fn(),
      delete: vi.fn(),
    };

    service = new JobApplicationService(mockRepo);
  });

  describe("Application creation & duplicate protection", () => {
    it("should resolve candidateId from authenticated user and create application", async () => {
      vi.mocked(prisma.candidateProfile.findUnique).mockResolvedValue(candidateProfile as any);
      vi.mocked(prisma.job.findUnique).mockResolvedValue(publishedJob as any);
      mockRepo.findByJobAndCandidate.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(sampleApp);

      const result = await service.createJobApplication(
        { jobId: publishedJob.id, coverLetter: "Hello" },
        candidateUser
      );

      expect(mockRepo.create).toHaveBeenCalledWith({
        jobId: publishedJob.id,
        candidateId: "cand-profile-1",
        coverLetter: "Hello",
        resume: undefined,
      });
      expect(result.id).toBe("app-123");
    });

    it("should reject non-CANDIDATE user applying for job", async () => {
      await expect(
        service.createJobApplication(
          { jobId: publishedJob.id },
          { userId: "emp-user", role: "EMPLOYER" }
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("should return ConflictError on duplicate application", async () => {
      vi.mocked(prisma.candidateProfile.findUnique).mockResolvedValue(candidateProfile as any);
      vi.mocked(prisma.job.findUnique).mockResolvedValue(publishedJob as any);
      mockRepo.findByJobAndCandidate.mockResolvedValue(sampleApp);

      await expect(
        service.createJobApplication({ jobId: publishedJob.id }, candidateUser)
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("Role-based list applications", () => {
    it("candidate sees only own applications", async () => {
      vi.mocked(prisma.candidateProfile.findUnique).mockResolvedValue(candidateProfile as any);
      mockRepo.findCandidateApplications.mockResolvedValue([sampleApp]);

      const apps = await service.getAllJobApplications(candidateUser);

      expect(mockRepo.findCandidateApplications).toHaveBeenCalledWith("cand-profile-1", undefined);
      expect(apps.length).toBe(1);
    });

    it("employer sees applications for company jobs", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue(employerProfile as any);
      mockRepo.findEmployerApplications.mockResolvedValue([sampleApp]);

      const apps = await service.getAllJobApplications(employerUser);

      expect(mockRepo.findEmployerApplications).toHaveBeenCalledWith("comp-1", undefined);
      expect(apps.length).toBe(1);
    });
  });

  describe("Role-based get single application", () => {
    it("candidate can view own application", async () => {
      vi.mocked(prisma.candidateProfile.findUnique).mockResolvedValue(candidateProfile as any);
      mockRepo.findRawById.mockResolvedValue(sampleApp);
      mockRepo.findById.mockResolvedValue(sampleApp);

      const app = await service.getJobApplicationById("app-123", candidateUser);
      expect(app).toEqual(sampleApp);
    });

    it("candidate cannot view another candidate application", async () => {
      vi.mocked(prisma.candidateProfile.findUnique).mockResolvedValue({ id: "other-cand" } as any);
      mockRepo.findRawById.mockResolvedValue(sampleApp);

      await expect(
        service.getJobApplicationById("app-123", { userId: "other-user", role: "CANDIDATE" })
      ).rejects.toThrow(ForbiddenError);
    });

    it("employer can view application for their company job", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue(employerProfile as any);
      mockRepo.findRawById.mockResolvedValue(sampleApp);
      mockRepo.findById.mockResolvedValue(sampleApp);

      const app = await service.getJobApplicationById("app-123", employerUser);
      expect(app).toEqual(sampleApp);
    });

    it("employer cannot view application for another company job", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue(otherEmployerProfile as any);
      mockRepo.findRawById.mockResolvedValue(sampleApp);

      await expect(
        service.getJobApplicationById("app-123", otherEmployerUser)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("Status update pipeline", () => {
    it("employer can update status for own company job application", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue(employerProfile as any);
      mockRepo.findRawById.mockResolvedValue(sampleApp);
      mockRepo.updateStatus.mockResolvedValue({ ...sampleApp, status: "IN_PROGRESS" });

      const updated = await service.updateApplicationStatus(
        "app-123",
        "IN_PROGRESS",
        employerUser
      );

      expect(mockRepo.updateStatus).toHaveBeenCalledWith("app-123", "IN_PROGRESS");
      expect(updated.status).toBe("IN_PROGRESS");
    });

    it("unrelated employer cannot update application status", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue(otherEmployerProfile as any);
      mockRepo.findRawById.mockResolvedValue(sampleApp);

      await expect(
        service.updateApplicationStatus("app-123", "SELECTED", otherEmployerUser)
      ).rejects.toThrow(ForbiddenError);
    });

    it("invalid status should be rejected", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue(employerProfile as any);
      mockRepo.findRawById.mockResolvedValue(sampleApp);

      await expect(
        service.updateApplicationStatus("app-123", "UNKNOWN_STATUS", employerUser)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("Application withdrawal and deletion", () => {
    it("candidate can withdraw own application", async () => {
      vi.mocked(prisma.candidateProfile.findUnique).mockResolvedValue(candidateProfile as any);
      mockRepo.findRawById.mockResolvedValue(sampleApp);
      mockRepo.withdraw.mockResolvedValue({ ...sampleApp, status: "withdrawn" });

      const res = await service.deleteJobApplication("app-123", candidateUser);

      expect(mockRepo.withdraw).toHaveBeenCalledWith("app-123");
      expect(res.status).toBe("withdrawn");
    });

    it("employer cannot delete candidate application", async () => {
      mockRepo.findRawById.mockResolvedValue(sampleApp);

      await expect(
        service.deleteJobApplication("app-123", employerUser)
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
