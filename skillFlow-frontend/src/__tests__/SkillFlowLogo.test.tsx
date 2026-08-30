import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock theme context
vi.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    logout: vi.fn(),
  }),
}));

// Mock ToastContext
vi.mock("@/context/ToastContext", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

import SkillFlowLogo from "@/components/SkillFlowLogo";

describe("SkillFlowLogo", () => {
  it("renders without crashing", () => {
    const { container } = render(<SkillFlowLogo />);
    expect(container).toBeTruthy();
  });

  it("contains the SkillFlow brand text", () => {
    const { container } = render(<SkillFlowLogo />);
    // "Skill" and "Flow" are in separate spans, search in container text content
    expect(container.textContent).toContain("Skill");
    expect(container.textContent).toContain("Flow");
  });
});
