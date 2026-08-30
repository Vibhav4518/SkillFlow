import { describe, expect, it } from "vitest";
import {
  createEmployerProfileSchema,
  updateEmployerProfileSchema,
} from "../schemas/employer-profile.schema.js";

describe("EmployerProfile Schemas", () => {
  describe("createEmployerProfileSchema", () => {
    it("should validate a valid payload", () => {
      const validPayload = {
        body: {
          companyId: "550e8400-e29b-41d4-a716-446655440000",
          designation: "HR Manager",
          department: "Human Resources",
          phone: "9876543210",
          profilePhotoUrl: "https://example.com/photo.jpg",
        },
      };

      const result = createEmployerProfileSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("should accept payload with only companyId", () => {
      const payload = {
        body: {
          companyId: "550e8400-e29b-41d4-a716-446655440000",
        },
      };

      const result = createEmployerProfileSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject non-UUID companyId", () => {
      const payload = {
        body: {
          companyId: "not-a-uuid",
        },
      };

      const result = createEmployerProfileSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("should reject invalid photo URL", () => {
      const payload = {
        body: {
          companyId: "550e8400-e29b-41d4-a716-446655440000",
          profilePhotoUrl: "invalid-url",
        },
      };

      const result = createEmployerProfileSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("updateEmployerProfileSchema", () => {
    it("should validate partial updates", () => {
      const payload = {
        body: {
          designation: "Lead Recruiter",
        },
      };

      const result = updateEmployerProfileSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject empty body for update", () => {
      const payload = {
        body: {},
      };

      const result = updateEmployerProfileSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
