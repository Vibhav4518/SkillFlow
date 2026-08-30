import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "../services/user.service.js";
import { userRepository } from "../repositories/user.repository.js";

vi.mock("../repositories/user.repository.js", () => ({
  userRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("UserService", () => {
  let userService: UserService;

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
    vi.clearAllMocks();
    userService = new UserService();
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      vi.mocked(userRepository.findAll).mockResolvedValue([mockUser]);

      const result = await userService.getAllUsers();

      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockUser.id,
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it("should return empty array when no users exist", async () => {
      vi.mocked(userRepository.findAll).mockResolvedValue([]);

      const result = await userService.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe("getUserById", () => {
    it("should return user when user exists", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

      const result = await userService.getUserById(mockUser.id);

      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it("should throw error when user does not exist", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      await expect(
        userService.getUserById("22222222-2222-4222-8222-222222222222"),
      ).rejects.toThrow("User not found");
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when email exists", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      const result = await userService.getUserByEmail(mockUser.email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result.email).toBe(mockUser.email);
    });

    it("should throw error when email does not exist", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(
        userService.getUserByEmail("missing@example.com"),
      ).rejects.toThrow("User not found");
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const updatedUser = {
        ...mockUser,
        fullName: "Rahul Kumar",
      };

      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(userRepository.update).mockResolvedValue(updatedUser);

      const result = await userService.updateUser(mockUser.id, {
        fullName: "Rahul Kumar",
      });

      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        fullName: "Rahul Kumar",
      });
      expect(result.fullName).toBe("Rahul Kumar");
    });

    it("should throw error when updating a missing user", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      await expect(
        userService.updateUser("22222222-2222-4222-8222-222222222222", {
          fullName: "New Name",
        }),
      ).rejects.toThrow("User not found");

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when new email is already used", async () => {
      const anotherUser = {
        ...mockUser,
        id: "33333333-3333-4333-8333-333333333333",
        email: "existing@example.com",
      };

      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(userRepository.findByEmail).mockResolvedValue(anotherUser);

      await expect(
        userService.updateUser(mockUser.id, {
          email: "existing@example.com",
        }),
      ).rejects.toThrow("Email already in use");

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should allow user to keep their current email", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(userRepository.update).mockResolvedValue(mockUser);

      const result = await userService.updateUser(mockUser.id, {
        email: mockUser.email,
      });

      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        email: mockUser.email,
      });
      expect(result.email).toBe(mockUser.email);
    });
  });

  describe("deleteUser", () => {
    it("should delete an existing user", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(userRepository.delete).mockResolvedValue(mockUser);

      await userService.deleteUser(mockUser.id);

      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });

    it("should throw error when deleting a missing user", async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      await expect(
        userService.deleteUser("22222222-2222-4222-8222-222222222222"),
      ).rejects.toThrow("User not found");

      expect(userRepository.delete).not.toHaveBeenCalled();
    });
  });
});