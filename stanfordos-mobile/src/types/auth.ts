import type { UserRole } from "../constants/roles";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  profileImage?: string | null;
}

export interface AuthTenant {
  id: string;
  name: string;
  slug?: string;
  logo?: string | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  tenant: AuthTenant | null;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

/** @deprecated Prefer LoginCredentials */
export interface LoginRequest {
  email: string;
  password: string;
  tenantCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  tenant?: AuthTenant | null;
}
