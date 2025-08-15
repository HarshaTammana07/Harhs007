import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "../AuthService";
import { LoginCredentials } from "@/types";

describe("AuthService", () => {
  let authService: AuthService;
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    authService = new AuthService();
    // Reset localStorage mock
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const credentials: LoginCredentials = {
        email: "ravi@family.com",
        password: "ravi123",
      };

      const user = await authService.login(credentials);

      expect(user).toEqual({
        id: "ravi@family.com",
        email: "ravi@family.com",
        name: "Tammana Manikyala Rao (Ravi)",
        role: "admin",
        familyMemberId: "ravi-001",
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "user_session",
        expect.stringContaining('"user":'),
      );
    });

    it("should throw error for invalid credentials", async () => {
      const credentials: LoginCredentials = {
        email: "invalid@family.com",
        password: "wrongpassword",
      };

      await expect(authService.login(credentials)).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("should throw error for wrong password", async () => {
      const credentials: LoginCredentials = {
        email: "ravi@family.com",
        password: "wrongpassword",
      };

      await expect(authService.login(credentials)).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("should login all family members with correct credentials", async () => {
      const familyMembers = [
        {
          email: "ravi@family.com",
          password: "ravi123",
          name: "Tammana Manikyala Rao (Ravi)",
          role: "admin",
        },
        {
          email: "lakshmi@family.com",
          password: "lakshmi123",
          name: "Tammana Krishna Dhana Lakshmi kumari (Lakshmi)",
          role: "member",
        },
        {
          email: "harsha@family.com",
          password: "harsha123",
          name: "Tammana Rama Naga Satya Harsha (Harsha)",
          role: "admin",
        },
        {
          email: "manu@family.com",
          password: "manu123",
          name: "Tammana Naga Venkata satya sai manoj (Manu)",
          role: "member",
        },
        {
          email: "nikitha@family.com",
          password: "nikitha123",
          name: "Tammana Nikitha (Nikitha)",
          role: "member",
        },
      ];

      for (const member of familyMembers) {
        const user = await authService.login({
          email: member.email,
          password: member.password,
        });

        expect(user.email).toBe(member.email);
        expect(user.name).toBe(member.name);
        expect(user.role).toBe(member.role);
      }
    });
  });

  describe("logout", () => {
    it("should remove session from localStorage", () => {
      authService.logout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("user_session");
    });
  });

  describe("getCurrentUser", () => {
    it("should return null when no session exists", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it("should return user when valid session exists", () => {
      const sessionData = {
        user: {
          id: "ravi@family.com",
          email: "ravi@family.com",
          name: "Tammana Manikyala Rao (Ravi)",
          role: "admin",
          familyMemberId: "ravi-001",
        },
        timestamp: Date.now(),
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

      const user = authService.getCurrentUser();

      expect(user).toEqual(sessionData.user);
    });

    it("should return null and logout when session is expired", () => {
      const expiredTimestamp = Date.now() - 31 * 60 * 1000; // 31 minutes ago
      const sessionData = {
        user: {
          id: "ravi@family.com",
          email: "ravi@family.com",
          name: "Tammana Manikyala Rao (Ravi)",
          role: "admin",
          familyMemberId: "ravi-001",
        },
        timestamp: expiredTimestamp,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("user_session");
    });

    it("should return null when session data is corrupted", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-json");

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when user is authenticated", () => {
      const sessionData = {
        user: {
          id: "ravi@family.com",
          email: "ravi@family.com",
          name: "Tammana Manikyala Rao (Ravi)",
          role: "admin",
          familyMemberId: "ravi-001",
        },
        timestamp: Date.now(),
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

      expect(authService.isAuthenticated()).toBe(true);
    });

    it("should return false when user is not authenticated", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe("isSessionExpired", () => {
    it("should return false for recent timestamp", () => {
      const recentTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago

      expect(authService.isSessionExpired(recentTimestamp)).toBe(false);
    });

    it("should return true for old timestamp", () => {
      const oldTimestamp = Date.now() - 31 * 60 * 1000; // 31 minutes ago

      expect(authService.isSessionExpired(oldTimestamp)).toBe(true);
    });

    it("should return true for timestamp exactly at timeout limit", () => {
      const timeoutTimestamp = Date.now() - (30 * 60 * 1000 + 1); // 30 minutes + 1ms ago

      expect(authService.isSessionExpired(timeoutTimestamp)).toBe(true);
    });
  });

  describe("refreshSession", () => {
    it("should update session timestamp when user is authenticated", () => {
      const sessionData = {
        user: {
          id: "ravi@family.com",
          email: "ravi@family.com",
          name: "Tammana Manikyala Rao (Ravi)",
          role: "admin",
          familyMemberId: "ravi-001",
        },
        timestamp: Date.now() - 20 * 60 * 1000, // 20 minutes ago
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

      authService.refreshSession();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "user_session",
        expect.stringContaining('"user":'),
      );

      // Verify the new timestamp is recent
      const setItemCall = mockLocalStorage.setItem.mock.calls[0];
      const newSessionData = JSON.parse(setItemCall[1]);
      const timeDiff = Date.now() - newSessionData.timestamp;
      expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
    });

    it("should not update session when user is not authenticated", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      authService.refreshSession();

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("getSessionTimeRemaining", () => {
    it("should return correct time remaining for active session", () => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      const sessionData = {
        user: {
          id: "ravi@family.com",
          email: "ravi@family.com",
          name: "Tammana Manikyala Rao (Ravi)",
          role: "admin",
          familyMemberId: "ravi-001",
        },
        timestamp: tenMinutesAgo,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

      const timeRemaining = authService.getSessionTimeRemaining();
      const expectedRemaining = 20 * 60 * 1000; // 20 minutes in milliseconds

      // Allow for small timing differences
      expect(timeRemaining).toBeGreaterThan(expectedRemaining - 1000);
      expect(timeRemaining).toBeLessThanOrEqual(expectedRemaining);
    });

    it("should return 0 for expired session", () => {
      const expiredTimestamp = Date.now() - 31 * 60 * 1000;
      const sessionData = {
        user: {
          id: "ravi@family.com",
          email: "ravi@family.com",
          name: "Tammana Manikyala Rao (Ravi)",
          role: "admin",
          familyMemberId: "ravi-001",
        },
        timestamp: expiredTimestamp,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

      const timeRemaining = authService.getSessionTimeRemaining();

      expect(timeRemaining).toBe(0);
    });

    it("should return 0 when no session exists", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const timeRemaining = authService.getSessionTimeRemaining();

      expect(timeRemaining).toBe(0);
    });

    it("should return 0 when session data is corrupted", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-json");

      const timeRemaining = authService.getSessionTimeRemaining();

      expect(timeRemaining).toBe(0);
    });
  });
});
