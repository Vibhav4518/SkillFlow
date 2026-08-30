import { beforeEach, describe, expect, it, vi } from "vitest";
import { userRepository, UserRepository } from "../repositories/user.repository.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";

describe("UserRepository", () => {
  let repository: UserRepository;

  const mockUser = {
    id: "11111111-1111-4111-8111-111111111111",
    fullName: "Rahul Sharma",
    email: "rahul@example.com",
    passwordHash: "hashed-password",
    role: "CANDIDATE" as const,
    createdAt: new Date("2026-08-01T10:00:00Z"),
    updatedAt: new Date("2026-08-01T10:00:00Z"),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    repository = userRepository;
  });

  describe("findAll", () => {
    it("should return all users ordered by createdAt desc", async () => {
      const prismaSpy = vi.spyOn(prisma.user, "findMany").mockResolvedValue([mockUser]);

      const result = await repository.findAll();

      expect(prismaSpy).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual([mockUser]);
    });
  });

  describe("findById", () => {
    it("should find user by id", async () => {
      const prismaSpy = vi.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser);

      const result = await repository.findById(mockUser.id);

      expect(prismaSpy).toHaveBeenCalledWith({
        where: {
          id: mockUser.id,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      vi.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should find user by email", async () => {
      const prismaSpy = vi.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser);

      const result = await repository.findByEmail(mockUser.email);

      expect(prismaSpy).toHaveBeenCalledWith({
        where: {
          email: mockUser.email,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("create", () => {
    it("should create and return new user", async () => {
      const createData = {
        fullName: "Rahul Sharma",
        email: "rahul@example.com",
        passwordHash: "hashed-password",
        role: "CANDIDATE" as const,
        updatedAt: new Date("2026-08-01T10:00:00Z"),
      };

      const prismaSpy = vi.spyOn(prisma.user, "create").mockResolvedValue(mockUser);

      const result = await repository.create(createData);

      expect(prismaSpy).toHaveBeenCalledWith({
        data: createData,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("update", () => {
    it("should update and return user", async () => {
      const updateData = { fullName: "Rahul Kumar" };
      const updatedUser = { ...mockUser, fullName: "Rahul Kumar" };
      const prismaSpy = vi.spyOn(prisma.user, "update").mockResolvedValue(updatedUser);

      const result = await repository.update(mockUser.id, updateData);

      expect(prismaSpy).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateData,
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe("delete", () => {
    it("should delete user and return deleted user", async () => {
      const prismaSpy = vi.spyOn(prisma.user, "delete").mockResolvedValue(mockUser);

      const result = await repository.delete(mockUser.id);

      expect(prismaSpy).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });
  });
});