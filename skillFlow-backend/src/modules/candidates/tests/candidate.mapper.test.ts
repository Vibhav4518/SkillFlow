import { describe, expect, it } from "vitest";
import { candidateMapper } from "../mappers/candidate.mapper.js";

describe("CandidateMapper", () => {
  describe("toProfileResponse", () => {
    it("should map candidate profile correctly", () => {
      const candidate = {
        id: "candidate-123",
        userId: "user-123",
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
        createdAt: new Date("2026-08-01T10:00:00.000Z"),
        updatedAt: new Date("2026-08-01T10:00:00.000Z"),
        user: {
          id: "user-123",
          fullName: "Avery Patel",
          email: "candidate@gmail.com",
          passwordHash: "secret-password-hash",
          role: "CANDIDATE" as const,
          createdAt: new Date("2026-08-01T10:00:00.000Z"),
          updatedAt: new Date("2026-08-01T10:00:00.000Z"),
        },
        skills: [
          {
            candidateId: "candidate-123",
            skillId: "skill-1",
            skill: {
              id: "skill-1",
              name: "JavaScript",
            },
          },
          {
            candidateId: "candidate-123",
            skillId: "skill-2",
            skill: {
              id: "skill-2",
              name: "TypeScript",
            },
          },
          {
            candidateId: "candidate-123",
            skillId: "skill-3",
            skill: {
              id: "skill-3",
              name: "Node.js",
            },
          },
        ],
      };

      const result = candidateMapper.toProfileResponse(candidate as any);

      expect(result).toEqual({
        id: "candidate-123",
        name: "Avery Patel",
        email: "candidate@gmail.com",
        phone: "9876543210",
        location: "Lucknow",
        skills: ["JavaScript", "TypeScript", "Node.js"],
      });
    });

    it("should return empty skills array when candidate has no skills", () => {
      const candidate = {
        id: "candidate-456",
        userId: "user-456",
        headline: null,
        summary: null,
        phone: "9999999999",
        location: "Delhi",
        experienceYears: null,
        preferredWorkType: null,
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
          id: "user-456",
          fullName: "Rahul Sharma",
          email: "rahul@gmail.com",
          passwordHash: "another-password-hash",
          role: "CANDIDATE" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        skills: [],
      };

      const result = candidateMapper.toProfileResponse(candidate as any);

      expect(result.skills).toEqual([]);
      expect(result).toEqual({
        id: "candidate-456",
        name: "Rahul Sharma",
        email: "rahul@gmail.com",
        phone: "9999999999",
        location: "Delhi",
        skills: [],
      });
    });

    it("should support null phone and location values", () => {
      const candidate = {
        id: "candidate-789",
        userId: "user-789",
        headline: null,
        summary: null,
        phone: null,
        location: null,
        experienceYears: null,
        preferredWorkType: null,
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
          id: "user-789",
          fullName: "Candidate User",
          email: "candidate2@gmail.com",
          passwordHash: "password-hash",
          role: "CANDIDATE" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        skills: [
          {
            candidateId: "candidate-789",
            skillId: "skill-10",
            skill: {
              id: "skill-10",
              name: "PostgreSQL",
            },
          },
        ],
      };

      const result = candidateMapper.toProfileResponse(candidate as any);

      expect(result.phone).toBeNull();
      expect(result.location).toBeNull();
      expect(result.skills).toEqual(["PostgreSQL"]);
    });

    it("should not expose passwordHash in candidate API response", () => {
      const candidate = {
        id: "candidate-security-test",
        userId: "user-security-test",
        headline: null,
        summary: null,
        phone: null,
        location: null,
        experienceYears: null,
        preferredWorkType: null,
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
          id: "user-security-test",
          fullName: "Secure Candidate",
          email: "secure@gmail.com",
          passwordHash: "$2b$12$SUPER_SECRET_PASSWORD_HASH",
          role: "CANDIDATE" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        skills: [],
      };

      const result = candidateMapper.toProfileResponse(candidate as any);

      expect(result).not.toHaveProperty("passwordHash");
      expect(result).not.toHaveProperty("user");
    });
  });
});