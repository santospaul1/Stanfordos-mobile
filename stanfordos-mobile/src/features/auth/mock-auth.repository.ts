import type { AuthRepository } from "./auth.repository";
import type { AuthSession, AuthUser, AuthTenant, LoginCredentials } from "../../types/auth";
import type { UserRole } from "../../constants/roles";
import { sessionStorage } from "../../services/session-storage";
import { tokenStorage } from "../../services/token-storage";

const DEMO_TENANT: AuthTenant = {
  id: "school-demo-1",
  name: "Stanford Demo Academy",
  slug: "demo",
  logo: null,
};

interface DemoAccount {
  email: string;
  password: string;
  user: AuthUser;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "admin@demo.com",
    password: "password123",
    user: {
      id: "u-admin-1",
      name: "Ada Admin",
      email: "admin@demo.com",
      role: "ADMIN",
      schoolId: DEMO_TENANT.id,
    },
  },
  {
    email: "teacher@demo.com",
    password: "password123",
    user: {
      id: "u-teacher-1",
      name: "Tom Teacher",
      email: "teacher@demo.com",
      role: "TEACHER",
      schoolId: DEMO_TENANT.id,
    },
  },
  {
    email: "student@demo.com",
    password: "password123",
    user: {
      id: "u-student-1",
      name: "Sam Student",
      email: "student@demo.com",
      role: "STUDENT",
      schoolId: DEMO_TENANT.id,
    },
  },
  {
    email: "parent@demo.com",
    password: "password123",
    user: {
      id: "u-parent-1",
      name: "Pat Parent",
      email: "parent@demo.com",
      role: "PARENT",
      schoolId: DEMO_TENANT.id,
    },
  },
  {
    email: "librarian@demo.com",
    password: "password123",
    user: {
      id: "u-lib-1",
      name: "Libby Librarian",
      email: "librarian@demo.com",
      role: "LIBRARIAN",
      schoolId: DEMO_TENANT.id,
    },
  },
  {
    email: "accountant@demo.com",
    password: "password123",
    user: {
      id: "u-acc-1",
      name: "Ann Accountant",
      email: "accountant@demo.com",
      role: "ACCOUNTANT",
      schoolId: DEMO_TENANT.id,
    },
  },
  {
    email: "platform@demo.com",
    password: "password123",
    user: {
      id: "u-plat-1",
      name: "Perry Platform",
      email: "platform@demo.com",
      role: "PLATFORM_ADMIN",
      schoolId: DEMO_TENANT.id,
    },
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeTokens(role: UserRole) {
  const suffix = `${role.toLowerCase()}-${Date.now()}`;
  return {
    accessToken: `mock-access-${suffix}`,
    refreshToken: `mock-refresh-${suffix}`,
  };
}

/**
 * Development-only auth.
 * Replace with BackendAuthRepository when tenant-aware login is ready.
 */
export const mockAuthRepository: AuthRepository = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await delay(700);

    const identifier = credentials.identifier.trim().toLowerCase();
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === identifier
    );

    if (!account || account.password !== credentials.password) {
      throw new Error("Invalid email or password. Try a demo account.");
    }

    const tokens = makeTokens(account.user.role);

    const session: AuthSession = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: account.user,
      tenant: DEMO_TENANT,
    };

    await tokenStorage.saveTokens(session.accessToken, session.refreshToken);
    await sessionStorage.save(session);

    return session;
  },

  async logout(): Promise<void> {
    await tokenStorage.clearTokens();
    await sessionStorage.clear();
  },

  async getSession(): Promise<AuthSession | null> {
    return sessionStorage.get();
  },
};

/** Quick reference for the login screen / docs */
export const DEMO_LOGIN_HINTS = DEMO_ACCOUNTS.map((a) => ({
  email: a.email,
  role: a.user.role,
  password: a.password,
}));
