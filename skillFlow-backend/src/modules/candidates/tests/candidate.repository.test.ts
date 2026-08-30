import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";
import { candidateRepository } from "../repositories/candidate.repository.js";

describe("CandidateRepository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should find candidate profile by userId", async () => {
    const userId = "11111111-1111-1111-1111-111111111111";
    const mockCandidate = {
      id: "22222222-2222-2222-2222-222222222222",
      userId,
      headline: "Backend Developer",
      summary: "Node.js developer",
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
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: userId,
        fullName: "Avery Patel",
        email: "candidate@gmail.com",
        passwordHash: "hashed-password",
        role: "CANDIDATE" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
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
      education: [],
      languages: [],
      experiences: [],
      projects: [],
      certifications: [],
    };

    const prismaSpy = vi
      .spyOn(prisma.candidateProfile, "findUnique")
      .mockResolvedValue(mockCandidate as any);

    const result = await candidateRepository.findByUserId(userId);

    expect(prismaSpy).toHaveBeenCalledTimes(1);
    expect(prismaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId },
      })
    );
    expect(result).toEqual(mockCandidate);
  });

  it("should return null when candidate profile is not found", async () => {
    const userId = "99999999-9999-9999-9999-999999999999";
    vi.spyOn(prisma.candidateProfile, "findUnique").mockResolvedValue(null);

    const result = await candidateRepository.findByUserId(userId);

    expect(result).toBeNull();
  });

  it("should query candidate using authenticated userId", async () => {
    const userId = "11111111-1111-1111-1111-111111111111";
    const prismaSpy = vi
      .spyOn(prisma.candidateProfile, "findUnique")
      .mockResolvedValue(null);

    await candidateRepository.findByUserId(userId);

    expect(prismaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId },
      }),
    );
  });

  it("should include related user data", async () => {
    const userId = "11111111-1111-1111-1111-111111111111";
    const prismaSpy = vi
      .spyOn(prisma.candidateProfile, "findUnique")
      .mockResolvedValue(null);

    await candidateRepository.findByUserId(userId);

    expect(prismaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          user: true,
        }),
      }),
    );
  });

  it("should include candidate skills with skill details", async () => {
    const userId = "11111111-1111-1111-1111-111111111111";
    const prismaSpy = vi
      .spyOn(prisma.candidateProfile, "findUnique")
      .mockResolvedValue(null);

    await candidateRepository.findByUserId(userId);

    expect(prismaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          skills: {
            include: {
              skill: true,
            },
          },
        }),
      }),
    );
  });

  it("should propagate prisma error", async () => {
    const userId = "11111111-1111-1111-1111-111111111111";
    vi.spyOn(prisma.candidateProfile, "findUnique").mockRejectedValue(
      new Error("Database query failed"),
    );

    await expect(candidateRepository.findByUserId(userId)).rejects.toThrow(
      "Database query failed",
    );
  });
});