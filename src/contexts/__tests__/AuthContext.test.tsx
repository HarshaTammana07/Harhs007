import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { authService } from "@/services/AuthService";

// Mock the AuthService
vi.mock("@/services/AuthService", () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshSession: vi.fn(),
  },
}));

// Test component that uses the auth context
function TestComponent() {
  const { user, isLoading, error, login, logout, refreshSession, clearError } =
    useAuth();

  return (
    <div>
      <div data-testid="user">{user ? user.name : "No user"}</div>
      <div data-testid="loading">{isLoading ? "Loading" : "Not loading"}</div>
      <div data-testid="error">{error || "No error"}</div>
      <button
        onClick={() => login({ email: "test@family.com", password: "test123" })}
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={refreshSession}>Refresh</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide initial state", () => {
    (authService.getCurrentUser as any).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("No user");
    expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
    expect(screen.getByTestId("error")).toHaveTextContent("No error");
  });

  it("should load existing user on mount", () => {
    const mockUser = {
      id: "ravi@family.com",
      email: "ravi@family.com",
      name: "Tammana Manikyala Rao (Ravi)",
      role: "admin" as const,
      familyMemberId: "ravi-001",
    };

    (authService.getCurrentUser as any).mockReturnValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent(
      "Tammana Manikyala Rao (Ravi)",
    );
  });

  it("should handle successful login", async () => {
    const mockUser = {
      id: "ravi@family.com",
      email: "ravi@family.com",
      name: "Tammana Manikyala Rao (Ravi)",
      role: "admin" as const,
      familyMemberId: "ravi-001",
    };

    (authService.getCurrentUser as any).mockReturnValue(null);
    (authService.login as any).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const loginButton = screen.getByText("Login");

    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent(
        "Tammana Manikyala Rao (Ravi)",
      );
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: "test@family.com",
      password: "test123",
    });
  });

  it("should handle login error", async () => {
    (authService.getCurrentUser as any).mockReturnValue(null);
    (authService.login as any).mockRejectedValue(
      new Error("Invalid credentials"),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const loginButton = screen.getByText("Login");

    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Invalid credentials",
      );
    });

    expect(screen.getByTestId("user")).toHaveTextContent("No user");
  });

  it("should handle logout", async () => {
    const mockUser = {
      id: "ravi@family.com",
      email: "ravi@family.com",
      name: "Tammana Manikyala Rao (Ravi)",
      role: "admin" as const,
      familyMemberId: "ravi-001",
    };

    (authService.getCurrentUser as any).mockReturnValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const logoutButton = screen.getByText("Logout");

    act(() => {
      logoutButton.click();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(screen.getByTestId("user")).toHaveTextContent("No user");
  });

  it("should handle refresh session", () => {
    (authService.getCurrentUser as any).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const refreshButton = screen.getByText("Refresh");

    act(() => {
      refreshButton.click();
    });

    expect(authService.refreshSession).toHaveBeenCalled();
  });

  it("should clear error", async () => {
    (authService.getCurrentUser as any).mockReturnValue(null);
    (authService.login as any).mockRejectedValue(new Error("Test error"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Trigger an error first
    const loginButton = screen.getByText("Login");
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Test error");
    });

    // Clear the error
    const clearErrorButton = screen.getByText("Clear Error");
    act(() => {
      clearErrorButton.click();
    });

    expect(screen.getByTestId("error")).toHaveTextContent("No error");
  });

  it("should throw error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });
});
