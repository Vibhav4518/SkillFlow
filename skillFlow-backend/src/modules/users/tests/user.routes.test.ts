import { beforeEach, describe, expect, it, vi } from "vitest";
import express, { type NextFunction, type Request, type Response } from "express";
import request from "supertest";
import { userRoutes } from "../routes/user.routes.js";
import { userController } from "../controllers/user.controller.js";

vi.mock("../controllers/user.controller.js", () => ({
  userController: {
    getAllUsers: vi.fn(),
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

vi.mock("../../../middlewares/validation.middleware.js", () => ({
  validate: () => (_req: Request, _res: Response, next: NextFunction) => {
    next();
  },
}));

describe("UserRoutes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/users", userRoutes);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/users", () => {
    it("should register GET /users route", async () => {
      vi.mocked(userController.getAllUsers).mockImplementation(
        async (_req: Request, res: Response) => {
          res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: [],
          });
        },
      );

      const response = await request(app).get("/api/v1/users");

      expect(response.status).toBe(200);
      expect(userController.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it("should return controller response", async () => {
      vi.mocked(userController.getAllUsers).mockImplementation(
        async (_req: Request, res: Response) => {
          res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: [
              {
                id: "11111111-1111-4111-8111-111111111111",
                fullName: "Rahul Sharma",
                email: "rahul@example.com",
              },
            ],
          });
        },
      );

      const response = await request(app).get("/api/v1/users");

      expect(response.body).toEqual({
        success: true,
        message: "Users fetched successfully",
        data: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            fullName: "Rahul Sharma",
            email: "rahul@example.com",
          },
        ],
      });
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("should call getUserById controller", async () => {
      vi.mocked(userController.getUserById).mockImplementation(
        async (req: Request, res: Response) => {
          res.status(200).json({
            success: true,
            data: { id: req.params.id },
          });
        },
      );

      const userId = "11111111-1111-4111-8111-111111111111";
      const response = await request(app).get(`/api/v1/users/${userId}`);

      expect(response.status).toBe(200);
      expect(userController.getUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe("PATCH /api/v1/users/:id", () => {
    it("should call updateUser controller", async () => {
      vi.mocked(userController.updateUser).mockImplementation(
        async (req: Request, res: Response) => {
          res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: { id: req.params.id, ...req.body },
          });
        },
      );

      const userId = "11111111-1111-4111-8111-111111111111";
      const response = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .send({ fullName: "Rahul Kumar" });

      expect(response.status).toBe(200);
      expect(userController.updateUser).toHaveBeenCalledTimes(1);
      expect(response.body.data.fullName).toBe("Rahul Kumar");
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should call deleteUser controller", async () => {
      vi.mocked(userController.deleteUser).mockImplementation(
        async (_req: Request, res: Response) => {
          res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: null,
          });
        },
      );

      const userId = "11111111-1111-4111-8111-111111111111";
      const response = await request(app).delete(`/api/v1/users/${userId}`);

      expect(response.status).toBe(200);
      expect(userController.deleteUser).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: true,
        message: "User deleted successfully",
        data: null,
      });
    });
  });

  describe("Unknown routes", () => {
    it("should return 404 for unknown user route", async () => {
      const response = await request(app).get("/api/v1/users/test/unknown/path");
      expect(response.status).toBe(404);
    });

    it("should not allow POST /api/v1/users", async () => {
      const response = await request(app)
        .post("/api/v1/users")
        .send({ fullName: "Rahul Sharma" });
      expect(response.status).toBe(404);
    });
  });
});