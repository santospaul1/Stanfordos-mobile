import { apiPost, apiGet, apiDelete } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { AuthSession, LoginCredentials } from "../types/auth";
import type { UserRole } from "../constants/roles";

/**
 * Backend login response shape from the API audit.
 * Note: native tenant login is still a P0 backend gap (MOB-BE-01).
 */
interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  userId: number | string;
  username: string;
  email: string;
  role: UserRole | string;
  firstName?: string;
  lastName?: string;
  mustChangePassword?: boolean;
  schoolId?: number | string;
  schoolName?: string;
}

function mapSession(data: BackendAuthResponse): AuthSession {
  const name =
    [data.firstName, data.lastName].filter(Boolean).join(" ") ||
    data.username ||
    data.email;

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: {
      id: String(data.userId),
      name,
      email: data.email,
      role: data.role as UserRole,
      schoolId: String(data.schoolId ?? "unknown"),
    },
    tenant: data.schoolId
      ? {
          id: String(data.schoolId),
          name: data.schoolName ?? "School",
        }
      : null,
  };
}

export const authApi = {
  /**
   * Current backend expects { username, password, remember }.
   * Tenant is derived from Origin on web — native still needs MOB-BE-01.
   */
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const data = await apiPost<BackendAuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      username: credentials.identifier,
      password: credentials.password,
      remember: true,
    });
    return mapSession(data);
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await apiPost(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    } catch {
      // Always clear local session even if revoke fails
    }
  },

  async listSessions() {
    return apiGet(API_ENDPOINTS.AUTH.SESSIONS);
  },

  async revokeSession(sessionId: string | number) {
    return apiDelete(`${API_ENDPOINTS.AUTH.SESSIONS}/${sessionId}`);
  },
};
