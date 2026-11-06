import type { UserRole } from "../constants/roles";

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string | number;
  profileImage?: string | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantCode: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}