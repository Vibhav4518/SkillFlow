import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.js";
import { candidateController } from "../controllers/candidate.controller.js";
import { candidateService } from "../services/candidate.service.js";

describe("CandidateController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return candidate profile with status 200", async () => {
    const mockCandidate = {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Avery Patel",
      email: "candidate@gmail.com",
      phone: "9876543210",
      location: "Lucknow",
      skills: ["JavaScript", "TypeScript", "Node.js"],
    };

    const req = {
      user: {
        id: "11111111-1111-1111-1111-111111111111",
        email: "candidate@gmail.com",
        role: "candidate",
      },
    } as unknown as AuthenticatedRequest;

    const statusMock = vi.fn();
    const jsonMock = vi.fn();
    const res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    statusMock.mockReturnValue(res);
    jsonMock.mockReturnValue(res);

    vi.spyOn(candidateService, "getMyProfile").mockResolvedValue(mockCandidate as any);

    await candidateController.getMyProfile(req, res);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data: mockCandidate,
    });
  });

  it("should call candidate service with authenticated userId", async () => {
    const authenticatedUserId = "11111111-1111-1111-1111-111111111111";
    const req = {
      user: {
        userId: authenticatedUserId,
        email: "candidate@gmail.com",
        role: "candidate",
      },
    } as unknown as AuthenticatedRequest;

    const statusMock = vi.fn();
    const jsonMock = vi.fn();
    const res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    statusMock.mockReturnValue(res);
    jsonMock.mockReturnValue(res);

    const mockCandidate = {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Avery Patel",
      email: "candidate@gmail.com",
      phone: null,
      location: null,
      skills: [],
    };

    const serviceSpy = vi.spyOn(candidateService, "getMyProfile").mockResolvedValue(mockCandidate as any);

    await candidateController.getMyProfile(req, res);

    expect(serviceSpy).toHaveBeenCalledWith(authenticatedUserId);
    expect(serviceSpy).toHaveBeenCalledTimes(1);
  });

  it("should return correct candidate response structure", async () => {
    const req = {
      user: {
        id: "11111111-1111-1111-1111-111111111111",
        email: "candidate@gmail.com",
        role: "candidate",
      },
    } as unknown as AuthenticatedRequest;

    const candidateData = {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Avery Patel",
      email: "candidate@gmail.com",
      phone: "9876543210",
      location: "Lucknow",
      skills: ["JavaScript", "TypeScript"],
    };

    const statusMock = vi.fn();
    const jsonMock = vi.fn();
    const res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    statusMock.mockReturnValue(res);
    jsonMock.mockReturnValue(res);

    vi.spyOn(candidateService, "getMyProfile").mockResolvedValue(candidateData as any);

    await candidateController.getMyProfile(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data: candidateData,
    });
  });

  it("should not expose passwordHash in response", async () => {
    const req = {
      user: {
        id: "11111111-1111-1111-1111-111111111111",
        email: "candidate@gmail.com",
        role: "candidate",
      },
    } as unknown as AuthenticatedRequest;

    const safeCandidateResponse = {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Avery Patel",
      email: "candidate@gmail.com",
      phone: "9876543210",
      location: "Lucknow",
      skills: [],
    };

    const statusMock = vi.fn();
    const jsonMock = vi.fn();
    const res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    statusMock.mockReturnValue(res);
    jsonMock.mockReturnValue(res);

    vi.spyOn(candidateService, "getMyProfile").mockResolvedValue(safeCandidateResponse as any);

    await candidateController.getMyProfile(req, res);

    const responseBody = jsonMock.mock.calls[0][0];
    expect(responseBody.data).not.toHaveProperty("passwordHash");
    expect(responseBody.data).not.toHaveProperty("password");
  });

  it("should propagate service error", async () => {
    const req = {
      user: {
        id: "11111111-1111-1111-1111-111111111111",
        email: "candidate@gmail.com",
        role: "candidate",
      },
    } as unknown as AuthenticatedRequest;

    const statusMock = vi.fn();
    const jsonMock = vi.fn();
    const res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    statusMock.mockReturnValue(res);
    jsonMock.mockReturnValue(res);

    vi.spyOn(candidateService, "getMyProfile").mockRejectedValue(new Error("Candidate profile not found"));

    await expect(candidateController.getMyProfile(req, res)).rejects.toThrow("Candidate profile not found");
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it("should call response status and json exactly once", async () => {
    const req = {
      user: {
        id: "11111111-1111-1111-1111-111111111111",
        email: "candidate@gmail.com",
        role: "candidate",
      },
    } as unknown as AuthenticatedRequest;

    const statusMock = vi.fn();
    const jsonMock = vi.fn();
    const res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    statusMock.mockReturnValue(res);
    jsonMock.mockReturnValue(res);

    vi.spyOn(candidateService, "getMyProfile").mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      name: "Avery Patel",
      email: "candidate@gmail.com",
      phone: null,
      location: null,
      skills: [],
    } as any);

    await candidateController.getMyProfile(req, res);

    expect(statusMock).toHaveBeenCalledTimes(1);
    expect(jsonMock).toHaveBeenCalledTimes(1);
  });
});