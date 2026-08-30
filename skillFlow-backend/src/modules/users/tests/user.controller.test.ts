import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { UserController } from "../controllers/user.controller.js";
import { userService } from "../services/user.service.js";

vi.mock("../services/user.service.js", () => ({
  userService: {
    getAllUsers: vi.fn(),
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

describe("UserController", () => {
  let userController: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const statusMock = vi.fn();
  const jsonMock = vi.fn();

  const mockUser = {
    id: "11111111-1111-4111-8111-111111111111",
    fullName: "Rahul Sharma",
    email: "rahul@example.com",
    role: "CANDIDATE" as const,
    createdAt: new Date("2026-08-01T10:00:00Z"),
    updatedAt: new Date("2026-08-01T10:00:00Z"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    userController = new UserController();
    statusMock.mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    };
    next = vi.fn();
  });

  describe("getAllUsers", () => {
    it("should return all users with status 200", async () => {
      req = {};
      vi.mocked(userService.getAllUsers).mockResolvedValue([mockUser]);

      await userController.getAllUsers(req as Request, res as Response, next);

      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Users fetched successfully",
        data: [mockUser],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should pass error to next when service fails", async () => {
      req = {};
      const error = new Error("Database error");
      vi.mocked(userService.getAllUsers).mockRejectedValue(error);

      await userController.getAllUsers(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    it("should return user by id with status 200", async () => {
      req = {
        params: { id: mockUser.id },
      };
      vi.mocked(userService.getUserById).mockResolvedValue(mockUser);

      await userController.getUserById(req as Request<{ id: string }>, res as Response, next);

      expect(userService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "User fetched successfully",
        data: mockUser,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should pass error to next when user is not found", async () => {
      req = {
        params: { id: mockUser.id },
      };
      const error = new Error("User not found");
      vi.mocked(userService.getUserById).mockRejectedValue(error);

      await userController.getUserById(req as Request<{ id: string }>, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update user and return status 200", async () => {
      const updatedUser = {
        ...mockUser,
        fullName: "Rahul Kumar",
      };
      req = {
        params: { id: mockUser.id },
        body: { fullName: "Rahul Kumar" },
      };
      vi.mocked(userService.updateUser).mockResolvedValue(updatedUser);

      await userController.updateUser(req as Request<{ id: string }>, res as Response, next);

      expect(userService.updateUser).toHaveBeenCalledWith(mockUser.id, {
        fullName: "Rahul Kumar",
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should pass update error to next", async () => {
      req = {
        params: { id: mockUser.id },
        body: { email: "existing@example.com" },
      };
      const error = new Error("Email already in use");
      vi.mocked(userService.updateUser).mockRejectedValue(error);

      await userController.updateUser(req as Request<{ id: string }>, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("should delete user and return status 200", async () => {
      req = {
        params: { id: mockUser.id },
      };
      vi.mocked(userService.deleteUser).mockResolvedValue(undefined);

      await userController.deleteUser(req as Request<{ id: string }>, res as Response, next);

      expect(userService.deleteUser).toHaveBeenCalledWith(mockUser.id);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully",
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should pass delete error to next", async () => {
      req = {
        params: { id: mockUser.id },
      };
      const error = new Error("User not found");
      vi.mocked(userService.deleteUser).mockRejectedValue(error);

      await userController.deleteUser(req as Request<{ id: string }>, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});