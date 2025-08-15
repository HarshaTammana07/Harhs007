import { AuthUser, LoginCredentials } from "@/types";

export class AuthService {
  private static readonly SESSION_KEY = "user_session";
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

  private readonly familyCredentials = [
    {
      email: "ravi@family.com",
      password: "ravi123",
      name: "Tammana Manikyala Rao (Ravi)",
      role: "admin" as const,
      familyMemberId: "ravi-001",
    },
    {
      email: "lakshmi@family.com",
      password: "lakshmi123",
      name: "Tammana Krishna Dhana Lakshmi kumari (Lakshmi)",
      role: "member" as const,
      familyMemberId: "lakshmi-001",
    },
    {
      email: "harsha@family.com",
      password: "harsha123",
      name: "Tammana Rama Naga Satya Harsha (Harsha)",
      role: "admin" as const,
      familyMemberId: "harsha-001",
    },
    {
      email: "manu@family.com",
      password: "manu123",
      name: "Tammana Naga Venkata satya sai manoj (Manu)",
      role: "member" as const,
      familyMemberId: "manu-001",
    },
    {
      email: "nikitha@family.com",
      password: "nikitha123",
      name: "Tammana Nikitha (Nikitha)",
      role: "member" as const,
      familyMemberId: "nikitha-001",
    },
  ];

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    const user = this.familyCredentials.find(
      (cred) =>
        cred.email === credentials.email &&
        cred.password === credentials.password,
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const authUser: AuthUser = {
      id: user.email,
      email: user.email,
      name: user.name,
      role: user.role,
      familyMemberId: user.familyMemberId,
    };

    const sessionData = {
      user: authUser,
      timestamp: Date.now(),
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    return authUser;
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  getCurrentUser(): AuthUser | null {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      if (!session) return null;

      const sessionData = JSON.parse(session);

      // Check if session has expired
      if (this.isSessionExpired(sessionData.timestamp)) {
        this.logout();
        return null;
      }

      return sessionData.user;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  isSessionExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.SESSION_TIMEOUT;
  }

  refreshSession(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const sessionData = {
        user: currentUser,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    }
  }

  getSessionTimeRemaining(): number {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      if (!session) return 0;

      const sessionData = JSON.parse(session);
      const elapsed = Date.now() - sessionData.timestamp;
      const remaining = this.SESSION_TIMEOUT - elapsed;

      return Math.max(0, remaining);
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
