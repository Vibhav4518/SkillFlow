import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmployerProfileController } from "../controllers/employer-profile.controller.js";

describe("EmployerProfileController", () => {
  let controller: EmployerProfileController;
  let mockService: any;
  let mockRes: any;
  let next: any;

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
    mockService = {
      createEmployerProfile: vi.fn(),
      getProfileByUserId: vi.fn(),
      updateEmployerProfile: vi.fn(),
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();

    controller = new EmployerProfileController(mockService);
  });

  describe("createProfile", () => {
    it("should return 201 and created profile data", async () => {
      const req: any = {
        user: { userId: "user-123", role: "EMPLOYER" },
        body: { companyId: "company-123", designation: "HR Manager" },
      };

      mockService.createEmployerProfile.mockResolvedValue(mockProfile);

      await controller.createProfile(req, mockRes, next);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Employer profile created successfully",
        data: mockProfile,
      });
    });

    it("should pass errors to next()", async () => {
      const req: any = {
        user: { userId: "user-123" },
        body: {},
      };

      const error = new Error("Failed");
      mockService.createEmployerProfile.mockRejectedValue(error);

      await controller.createProfile(req, mockRes, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMyProfile", () => {
    it("should return 200 and profile data", async () => {
      const req: any = {
        user: { userId: "user-123", role: "EMPLOYER" },
      };

      mockService.getProfileByUserId.mockResolvedValue(mockProfile);

      await controller.getMyProfile(req, mockRes, next);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Employer profile fetched successfully",
        data: mockProfile,
      });
    });
  });

  describe("updateMyProfile", () => {
    it("should return 200 and updated profile data", async () => {
      const req: any = {
        user: { userId: "user-123", role: "EMPLOYER" },
        body: { designation: "VP Talent" },
      };

      const updated = { ...mockProfile, designation: "VP Talent" };
      mockService.updateEmployerProfile.mockResolvedValue(updated);

      await controller.updateMyProfile(req, mockRes, next);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Employer profile updated successfully",
        data: updated,
      });
    });
  });
});
