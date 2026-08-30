import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { ToastProvider, useToast } from "@/context/ToastContext";

// Test component that triggers toasts
function TestConsumer({ variant, message }: { variant: string; message: string }) {
  const toast = useToast();
  return (
    <button
      onClick={() => {
        if (variant === "success") toast.success(message);
        else if (variant === "error") toast.error(message);
        else if (variant === "warning") toast.warning(message);
        else if (variant === "info") toast.info(message);
      }}
    >
      Trigger Toast
    </button>
  );
}

describe("ToastContext", () => {
  it("should render ToastProvider without errors", () => {
    const { container } = render(
      <ToastProvider>
        <div>children</div>
      </ToastProvider>
    );
    expect(container).toBeTruthy();
  });

  it("should show a success toast", async () => {
    render(
      <ToastProvider>
        <TestConsumer variant="success" message="Job saved successfully!" />
      </ToastProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Trigger Toast"));
    });

    expect(screen.getByText("Job saved successfully!")).toBeTruthy();
  });

  it("should show an error toast", async () => {
    render(
      <ToastProvider>
        <TestConsumer variant="error" message="Something went wrong!" />
      </ToastProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Trigger Toast"));
    });

    expect(screen.getByText("Something went wrong!")).toBeTruthy();
  });

  it("should throw if useToast is used outside ToastProvider", () => {
    const originalError = console.error;
    console.error = vi.fn();

    function BadComponent() {
      useToast();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow("useToast must be used within a <ToastProvider>");

    console.error = originalError;
  });
});
