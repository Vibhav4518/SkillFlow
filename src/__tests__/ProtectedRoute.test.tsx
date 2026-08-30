import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import React from "react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    pathname: "/",
  }),
}));

// Mock AuthContext
const mockAuthContext = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));

// Mock ToastContext
vi.mock("@/context/ToastContext", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

import ProtectedRoute from "@/components/ProtectedRoute";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner when auth is loading", () => {
    mockAuthContext.isLoading = true;
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.user = null;

    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(container.querySelector(".animate-spin")).toBeTruthy();
    mockAuthContext.isLoading = false;
  });

  it("renders null when not authenticated", () => {
    mockAuthContext.isLoading = false;
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.user = null;

    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("renders children when authenticated with no role restriction", () => {
    mockAuthContext.isLoading = false;
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.user = { id: "1", fullName: "Test", email: "t@t.com", role: "CANDIDATE" } as any;

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeTruthy();
  });

  it("renders children when authenticated with matching role", () => {
    mockAuthContext.isLoading = false;
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.user = { id: "1", fullName: "Admin", email: "a@a.com", role: "ADMIN" } as any;

    render(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Admin Content")).toBeTruthy();
  });

  it("renders null when role doesn't match", () => {
    mockAuthContext.isLoading = false;
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.user = { id: "1", fullName: "Test", email: "t@t.com", role: "CANDIDATE" } as any;

    render(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div>Admin Only</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("Admin Only")).toBeNull();
  });
});
