import { render, screen, fireEvent } from "@testing-library/react";
import { AppLayout } from "../AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

// Mock the auth context with a test user
const mockUser = {
  id: "test-id",
  email: "test@family.com",
  name: "Test User",
  role: "admin" as const,
};

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AppLayout", () => {
  beforeEach(() => {
    // Mock localStorage for auth
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => JSON.stringify(mockUser)),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it("renders children content", () => {
    render(
      <MockAuthProvider>
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders header with menu button on mobile", () => {
    render(
      <MockAuthProvider>
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      </MockAuthProvider>,
    );

    const menuButton = screen.getByRole("button", { name: /open sidebar/i });
    expect(menuButton).toBeInTheDocument();
  });

  it("renders navigation items", () => {
    render(
      <MockAuthProvider>
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Family Members")).toBeInTheDocument();
    expect(screen.getByText("Properties")).toBeInTheDocument();
    expect(screen.getByText("Insurance")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("opens mobile sidebar when menu button is clicked", () => {
    render(
      <MockAuthProvider>
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      </MockAuthProvider>,
    );

    const menuButton = screen.getByRole("button", { name: /open sidebar/i });
    fireEvent.click(menuButton);

    // Check if mobile sidebar is opened (dialog should be visible)
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
