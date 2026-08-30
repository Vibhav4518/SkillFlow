import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmployerProfileRepository } from "../repositories/employer-profile.repository.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";

vi.mock("../../../infrastructure/database/lib/prisma.js", () => ({
  prisma: {
    employerProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("EmployerProfileRepository", () => {
  let repository: EmployerProfileRepository;

  const mockProfile = {
    id: "profile-1",
    userId: "user-1",
    companyId: "company-1",
    designation: "HR Head",
    department: "Talent Acquisition",
    phone: "9876543210",
    profilePhotoUrl: "https://example.com/photo.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new EmployerProfileRepository();
  });

  it("findByUserId should find profile by userId", async () => {
    vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue(mockProfile as any);

    const result = await repository.findByUserId("user-1");

    expect(prisma.employerProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
    expect(result).toEqual(mockProfile);
  });

  it("findById should find profile by id", async () => {
    vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue(mockProfile as any);

    const result = await repository.findById("profile-1");

    expect(prisma.employerProfile.findUnique).toHaveBeenCalledWith({
      where: { id: "profile-1" },
    });
    expect(result).toEqual(mockProfile);
  });

  it("create should create a new employer profile", async () => {
    vi.mocked(prisma.employerProfile.create).mockResolvedValue(mockProfile as any);

    const dto = {
      companyId: "company-1",
      designation: "HR Head",
      department: "Talent Acquisition",
      phone: "9876543210",
      profilePhotoUrl: "https://example.com/photo.jpg",
    };

    const result = await repository.create("user-1", dto);

    expect(prisma.employerProfile.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        companyId: "company-1",
        designation: "HR Head",
        department: "Talent Acquisition",
        phone: "9876543210",
        profilePhotoUrl: "https://example.com/photo.jpg",
      },
    });
    expect(result).toEqual(mockProfile);
  });

  it("update should update an existing profile", async () => {
    const updated = { ...mockProfile, designation: "VP of HR" };
    vi.mocked(prisma.employerProfile.update).mockResolvedValue(updated as any);

    const result = await repository.update("user-1", { designation: "VP of HR" });

    expect(prisma.employerProfile.update).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      data: { designation: "VP of HR" },
    });
    expect(result?.designation).toBe("VP of HR");
  });

  it("findWithCompanyAndUser should include relations", async () => {
    const profileWithRelations = {
      ...mockProfile,
      user: { id: "user-1", email: "hr@company.com", fullName: "HR User", role: "EMPLOYER" },
      company: { id: "company-1", name: "Tech Corp", location: "Pune" },
    };
    vi.mocked(prisma.employerProfile.findUnique).mockResolvedValue(profileWithRelations as any);

    const result = await repository.findWithCompanyAndUser("user-1");

    expect(result).toEqual(profileWithRelations);
  });
});
