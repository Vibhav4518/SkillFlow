import { describe, expect, it, vi, beforeEach } from "vitest";
import { JobService } from "../services/job.service.js";
import { promoteJobSchema } from "../validators/job.validator.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/app.error.js";

vi.mock("../../../infrastructure/database/lib/prisma.js", () => ({
  prisma: {
    employerProfile: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Job Promotion", () => {
  describe("promoteJobSchema", () => {
    it("should accept valid promotion payload", () => {
      const valid = {
        body: {
          promotionType: "FEATURED",
          promotionStartAt: "2026-08-21T00:00:00.000Z",
          promotionEndAt: "2026-08-28T00:00:00.000Z",
          promotionPaymentId: "pay_12345",
        },
      };

      const result = promoteJobSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject invalid promotionType", () => {
      const invalid = {
        body: {
          promotionType: "UNKNOWN",
          promotionStartAt: "2026-08-21T00:00:00.000Z",
          promotionEndAt: "2026-08-28T00:00:00.000Z",
        },
      };

      const result = promoteJobSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject end date before start date", () => {
      const invalid = {
        body: {
          promotionType: "FEATURED",
          promotionStartAt: "2026-08-28T00:00:00.000Z",
          promotionEndAt: "2026-08-21T00:00:00.000Z",
        },
      };

      const result = promoteJobSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("JobService.promoteJob", () => {
    let service: JobService;
    let mockRepo: any;

    beforeEach(() => {
      vi.clearAllMocks();
      mockRepo = {
        findAll: vi.fn(),
        findById: vi.fn(),
        findRawById: vi.fn(),
        promoteJob: vi.fn(),
      };
      service = new JobService(mockRepo);
    });

    it("should promote job when employer owns the job", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue({
        id: "emp-1",
        userId: "user-emp-1",
        companyId: "company-100",
      } as any);

      mockRepo.findRawById.mockResolvedValue({
        id: "job-1",
        companyId: "company-100",
        title: "Senior Engineer",
      });

      const updatedJob = { id: "job-1", isPromoted: true, promotionType: "FEATURED" };
      mockRepo.promoteJob.mockResolvedValue(updatedJob);

      const dto = {
        promotionType: "FEATURED" as const,
        promotionStartAt: "2026-08-21T00:00:00.000Z",
        promotionEndAt: "2026-08-28T00:00:00.000Z",
        promotionPaymentId: "pay_123",
      };

      const result = await service.promoteJob("job-1", "user-emp-1", dto);

      expect(result.isPromoted).toBe(true);
      expect(mockRepo.promoteJob).toHaveBeenCalledWith(
        "job-1",
        expect.objectContaining({
          promotionType: "FEATURED",
          promotionPaymentId: "pay_123",
        })
      );
    });

    it("should reject unauthenticated request", async () => {
      await expect(
        service.promoteJob("job-1", "", {
          promotionType: "FEATURED",
          promotionStartAt: "2026-08-21T00:00:00.000Z",
          promotionEndAt: "2026-08-28T00:00:00.000Z",
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should reject if user has no employer profile", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue(null);

      await expect(
        service.promoteJob("job-1", "user-non-emp", {
          promotionType: "FEATURED",
          promotionStartAt: "2026-08-21T00:00:00.000Z",
          promotionEndAt: "2026-08-28T00:00:00.000Z",
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject promoting job of another company", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue({
        id: "emp-1",
        userId: "user-emp-1",
        companyId: "company-100",
      } as any);

      mockRepo.findRawById.mockResolvedValue({
        id: "job-1",
        companyId: "company-OTHER",
        title: "Senior Engineer",
      });

      await expect(
        service.promoteJob("job-1", "user-emp-1", {
          promotionType: "FEATURED",
          promotionStartAt: "2026-08-21T00:00:00.000Z",
          promotionEndAt: "2026-08-28T00:00:00.000Z",
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject non-existent job", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue({
        id: "emp-1",
        userId: "user-emp-1",
        companyId: "company-100",
      } as any);

      mockRepo.findRawById.mockResolvedValue(null);

      await expect(
        service.promoteJob("job-unknown", "user-emp-1", {
          promotionType: "FEATURED",
          promotionStartAt: "2026-08-21T00:00:00.000Z",
          promotionEndAt: "2026-08-28T00:00:00.000Z",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should reject invalid date order in service layer", async () => {
      vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue({
        id: "emp-1",
        userId: "user-emp-1",
        companyId: "company-100",
      } as any);

      mockRepo.findRawById.mockResolvedValue({
        id: "job-1",
        companyId: "company-100",
      });

      await expect(
        service.promoteJob("job-1", "user-emp-1", {
          promotionType: "FEATURED",
          promotionStartAt: "2026-08-28T00:00:00.000Z",
          promotionEndAt: "2026-08-21T00:00:00.000Z",
        })
      ).rejects.toThrow(BadRequestError);
    });
  });
});
