import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmployerProfileService } from "../services/employer-profile.service.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/app.error.js";

vi.mock("../../../infrastructure/database/lib/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    employerProfile: {
      findUnique: vi.fn(),
    },
  },
}));

describe("EmployerProfileService", () => {
  let service: EmployerProfileService;
  let mockEmployerRepo: any;
  let mockCompanyRepo: any;

  const mockUser = {
    id: "user-123",
    email: "employer@example.com",
    fullName: "Jane Doe",
    role: "EMPLOYER",
  };

  const mockCompany = {
    id: "company-123",
    name: "Acme Corp",
    websiteUrl: "https://acme.com",
    logoUrl: "https://acme.com/logo.png",
    location: "Mumbai",
    verificationStatus: "VERIFIED",
    deletedAt: null,
  };

  const mockProfile = {
    id: "profile-123",
    userId: "user-123",
    companyId: "company-123",
    designation: "HR Manager",
    department: "Talent",
    phone: "9876543210",
    profilePhotoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockEmployerRepo = {
      findByUserId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findWithCompanyAndUser: vi.fn(),
      findCompanyByEmployer: vi.fn(),
    };

    mockCompanyRepo = {
      findCompanyById: vi.fn(),
    };

    service = new EmployerProfileService(mockEmployerRepo, mockCompanyRepo);
  });

  describe("createEmployerProfile", () => {
    it("should successfully create employer profile for EMPLOYER role user", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      mockEmployerRepo.findByUserId.mockResolvedValue(null);
      mockCompanyRepo.findCompanyById.mockResolvedValue(mockCompany);
      mockEmployerRepo.create.mockResolvedValue(mockProfile);

      const dto = {
        companyId: "company-123",
        designation: "HR Manager",
        department: "Talent",
        phone: "9876543210",
      };

      const result = await service.createEmployerProfile("user-123", dto);

      expect(result.id).toBe("profile-123");
      expect(result.userId).toBe("user-123");
      expect(result.user?.email).toBe("employer@example.com");
      expect(result.company?.name).toBe("Acme Corp");
    });

    it("should throw UnauthorizedError if userId is empty", async () => {
      await expect(
        service.createEmployerProfile("", { companyId: "company-123" })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw NotFoundError if user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        service.createEmployerProfile("user-nonexistent", { companyId: "company-123" })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError if user role is not EMPLOYER", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        role: "CANDIDATE",
      } as any);

      await expect(
        service.createEmployerProfile("user-123", { companyId: "company-123" })
      ).rejects.toThrow(ForbiddenError);
    });

    it("should throw ConflictError if employer profile already exists", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      mockEmployerRepo.findByUserId.mockResolvedValue(mockProfile);

      await expect(
        service.createEmployerProfile("user-123", { companyId: "company-123" })
      ).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError if company does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      mockEmployerRepo.findByUserId.mockResolvedValue(null);
      mockCompanyRepo.findCompanyById.mockResolvedValue(null);

      await expect(
        service.createEmployerProfile("user-123", { companyId: "company-nonexistent" })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getProfileByUserId", () => {
    it("should return employer profile with user and company info", async () => {
      mockEmployerRepo.findWithCompanyAndUser.mockResolvedValue({
        ...mockProfile,
        user: mockUser,
        company: mockCompany,
      });

      const result = await service.getProfileByUserId("user-123");

      expect(result.id).toBe("profile-123");
      expect(result.user?.fullName).toBe("Jane Doe");
      expect(result.company?.name).toBe("Acme Corp");
    });

    it("should throw NotFoundError if profile not found", async () => {
      mockEmployerRepo.findWithCompanyAndUser.mockResolvedValue(null);

      await expect(service.getProfileByUserId("user-unknown")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateEmployerProfile", () => {
    it("should update and return updated profile", async () => {
      mockEmployerRepo.findByUserId.mockResolvedValue(mockProfile);
      mockEmployerRepo.findWithCompanyAndUser.mockResolvedValue({
        ...mockProfile,
        designation: "VP HR",
        user: mockUser,
        company: mockCompany,
      });

      const result = await service.updateEmployerProfile("user-123", {
        designation: "VP HR",
      });

      expect(mockEmployerRepo.update).toHaveBeenCalledWith("user-123", {
        designation: "VP HR",
      });
      expect(result.designation).toBe("VP HR");
    });

    it("should throw NotFoundError if updating non-existent profile", async () => {
      mockEmployerRepo.findByUserId.mockResolvedValue(null);

      await expect(
        service.updateEmployerProfile("user-unknown", { designation: "VP HR" })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
