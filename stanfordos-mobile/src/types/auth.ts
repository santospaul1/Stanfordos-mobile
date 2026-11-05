import type { UserRole } from "../constants/roles";

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;

  // School/tenant identifier returned by the backend.
  schoolId: string | number;

  profileImage?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;

  // Proposed native authentication contract.
  // Backend must validate this against the user's school.
  tenantCode: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
