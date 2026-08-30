import { beforeEach, describe, expect, it, vi } from "vitest";
import { candidateService } from "../services/candidate.service.js";
import { candidateRepository } from "../repositories/candidate.repository.js";
import { candidateMapper } from "../mappers/candidate.mapper.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";

describe("CandidateService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getMyProfile", () => {
    it("should return candidate profile successfully", async () => {
      const userId = "11111111-1111-1111-1111-111111111111";

      const mockCandidate = {
        id: "22222222-2222-2222-2222-222222222222",
        userId,
        headline: "Backend Developer",
        summary: "Node.js and TypeScript developer",
        phone: "9876543210",
        location: "Lucknow",
        experienceYears: 1,
        preferredWorkType: "REMOTE" as const,
        resumeUrl: null,
        resumeOriginalName: null,
        resumeFileSize: null,
        resumeUploadedAt: null,
        linkedinUrl: null,
        githubUrl: null,
        portfolioUrl: null,
        createdAt: new Date("2026-08-01T10:00:00.000Z"),
        updatedAt: new Date("2026-08-01T10:00:00.000Z"),
        user: {
          id: userId,
          fullName: "Avery Patel",
          email: "candidate@gmail.com",
          passwordHash: "hashed-password",
          role: "CANDIDATE" as const,
          createdAt: new Date("2026-08-01T10:00:00.000Z"),
          updatedAt: new Date("2026-08-01T10:00:00.000Z"),
        },
        skills: [
          {
            candidateId: "22222222-2222-2222-2222-222222222222",
            skillId: "33333333-3333-3333-3333-333333333333",
            skill: {
              id: "33333333-3333-3333-3333-333333333333",
              name: "TypeScript",
            },
          },
        ],
      };

      const expectedResponse = {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Avery Patel",
        email: "candidate@gmail.com",
        phone: "9876543210",
        location: "Lucknow",
        skills: ["TypeScript"],
      };

      const repositorySpy = vi
        .spyOn(candidateRepository, "findByUserId")
        .mockResolvedValue(mockCandidate as any);

      const mapperSpy = vi
        .spyOn(candidateMapper, "toCompleteProfileResponse")
        .mockReturnValue(expectedResponse as any);

      const result = await candidateService.getMyProfile(userId);

      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(userId);
      expect(mapperSpy).toHaveBeenCalledTimes(1);
      expect(mapperSpy).toHaveBeenCalledWith(mockCandidate);
      expect(result).toEqual(expectedResponse);
    });

    it("should throw error when user is not found", async () => {
      const userId = "55555555-5555-5555-5555-555555555555";

      const repositorySpy = vi
        .spyOn(candidateRepository, "findByUserId")
        .mockResolvedValue(null);

      vi.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      const mapperSpy = vi.spyOn(candidateMapper, "toProfileResponse");

      await expect(candidateService.getMyProfile(userId)).rejects.toThrow(
        "User not found",
      );
      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(userId);
      expect(mapperSpy).not.toHaveBeenCalled();
    });

    it("should propagate repository error", async () => {
      const userId = "66666666-6666-6666-6666-666666666666";
      const databaseError = new Error("Database connection failed");

      const repositorySpy = vi
        .spyOn(candidateRepository, "findByUserId")
        .mockRejectedValue(databaseError);

      const mapperSpy = vi.spyOn(candidateMapper, "toProfileResponse");

      await expect(candidateService.getMyProfile(userId)).rejects.toThrow(
        "Database connection failed",
      );
      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(userId);
      expect(mapperSpy).not.toHaveBeenCalled();
    });
  });
});