import { describe, it, expect } from "vitest";

import {
  toJobListItem,
  toJobDetail,
} from "../mappers/job.mapper.js";

describe("JobMapper", () => {
  const createdAt = new Date("2026-08-10T10:00:00.000Z");
  const updatedAt = new Date("2026-08-10T11:00:00.000Z");

  const mockJob = {
    id: "job-1",
    slug: "software-developer",
    title: "Software Developer",

    description:
      "Build scalable backend applications using Node.js and PostgreSQL.",

    createdAt,
    updatedAt,

    company: {
      id: "company-1",
      name: "ABC Technologies",
      logoUrl: "https://example.com/logo.png",
      location: "Lucknow, India",
    },

    category: {
      id: "category-1",
      name: "Technology",
    },

    jobSkills: [
      {
        skill: {
          id: "skill-1",
          name: "JavaScript",
        },
      },
      {
        skill: {
          id: "skill-2",
          name: "Node.js",
        },
      },
    ],
  };

  // ============================================================
  // toJobListItem()
  // ============================================================

  describe("toJobListItem()", () => {
    it("should transform job into list response", () => {
      const result = toJobListItem(mockJob as any);

      expect(result).toBeDefined();

      expect(result.id).toBe("job-1");
      expect(result.slug).toBe("software-developer");
      expect(result.title).toBe("Software Developer");

      expect(result.company).toBeDefined();
      expect(result.category).toBeDefined();
    });
  });

  // ============================================================
  // toJobDetail()
  // ============================================================

  describe("toJobDetail()", () => {
    it("should transform job into detail response", () => {
      const result = toJobDetail(mockJob as any);

      expect(result).toBeDefined();

      expect(result.id).toBe("job-1");
      expect(result.slug).toBe("software-developer");
      expect(result.title).toBe("Software Developer");

      expect(result.description).toBe(
        "Build scalable backend applications using Node.js and PostgreSQL."
      );

      expect(result.createdAt).toBe(
        "2026-08-10T10:00:00.000Z"
      );

      expect(result.updatedAt).toBe(
        "2026-08-10T11:00:00.000Z"
      );
    });

    it("should format relative time and salary min/max variations correctly", () => {
      const now = new Date();
      const justNowJob = { ...mockJob, createdAt: new Date(now.getTime() - 10 * 1000) };
      expect(toJobListItem(justNowJob as any).time).toBe("Just now");

      const minsAgoJob = { ...mockJob, createdAt: new Date(now.getTime() - 5 * 60 * 1000) };
      expect(toJobListItem(minsAgoJob as any).time).toBe("5 min ago");

      const hoursAgoJob = { ...mockJob, createdAt: new Date(now.getTime() - 3 * 3600 * 1000) };
      expect(toJobListItem(hoursAgoJob as any).time).toBe("3 hours ago");

      const daysAgoJob = { ...mockJob, createdAt: new Date(now.getTime() - 10 * 86400 * 1000) };
      expect(toJobListItem(daysAgoJob as any).time).toBe("10 days ago");

      const oldJob = { ...mockJob, createdAt: new Date("2020-01-01T00:00:00Z") };
      expect(toJobListItem(oldJob as any).time).toBeDefined();

      const nullSalaryJob = { ...mockJob, salaryMin: null, salaryMax: null };
      expect(toJobListItem(nullSalaryJob as any).salary).toBe("Not specified");

      const minOnlySalaryJob = { ...mockJob, salaryMin: 5000, salaryMax: null };
      expect(toJobListItem(minOnlySalaryJob as any).salary).toBe("From $5000");

      const maxOnlySalaryJob = { ...mockJob, salaryMin: null, salaryMax: 10000 };
      expect(toJobListItem(maxOnlySalaryJob as any).salary).toBe("Up to $10000");

      const customTypeJob = { ...mockJob, jobType: "FREELANCE" };
      expect(toJobListItem(customTypeJob as any).type).toBe("FREELANCE");
    });
  });
});