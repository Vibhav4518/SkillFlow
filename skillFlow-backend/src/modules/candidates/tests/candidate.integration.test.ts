import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { candidateRouter } from "../routes/candidate.routes.js";
import { candidateService } from "../services/candidate.service.js";
import { JwtService } from "../../../infrastructure/security/jwt.service.js";
import { globalErrorHandler } from "../../../middlewares/error.middleware.js";

describe("Candidate API Integration Tests", () => {
  let validToken: string;

  beforeEach(() => {
    vi.restoreAllMocks();
    validToken = JwtService.generateAccessToken({
      userId: "11111111-1111-1111-1111-111111111111",
      email: "candidate@gmail.com",
      role: "candidate",
    });
  });

  it("should return 401 when authorization header is missing", async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/v1/candidate", candidateRouter);
    app.use(globalErrorHandler);

    const response = await request(app).get("/api/v1/candidate/me");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
  });

  it("should return 401 when authorization header is invalid", async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/v1/candidate", candidateRouter);
    app.use(globalErrorHandler);

    const response = await request(app)
      .get("/api/v1/candidate/me")
      .set("Authorization", "InvalidToken");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should return 401 when access token is invalid", async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/v1/candidate", candidateRouter);
    app.use(globalErrorHandler);

    const response = await request(app)
      .get("/api/v1/candidate/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should return 404 for unknown candidate endpoint when authenticated", async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/v1/candidate", candidateRouter);
    app.use(globalErrorHandler);

    const response = await request(app)
      .get("/api/v1/candidate/unknown")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(404);
  });

  it("should return 404 for POST /candidate/me when authenticated", async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/v1/candidate", candidateRouter);
    app.use(globalErrorHandler);

    const response = await request(app)
      .post("/api/v1/candidate/me")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(404);
  });

  it("should not call candidate service when authentication fails", async () => {
    const serviceSpy = vi.spyOn(candidateService, "getMyProfile");
    const app = express();
    app.use(express.json());
    app.use("/api/v1/candidate", candidateRouter);
    app.use(globalErrorHandler);

    const response = await request(app).get("/api/v1/candidate/me");

    expect(response.status).toBe(401);
    expect(serviceSpy).not.toHaveBeenCalled();
  });
});