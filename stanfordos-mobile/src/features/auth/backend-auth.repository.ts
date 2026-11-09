import type { AuthRepository } from "./auth.repository";
import type { AuthSession, LoginCredentials } from "../../types/auth";
import { authApi } from "../../api/auth.api";
import { sessionStorage } from "../../services/session-storage";
import { tokenStorage } from "../../services/token-storage";

/**
 * Production auth adapter.
 * Requires backend tenant-aware login (MOB-BE-01) for multi-school safety.
 * Until then prefer MockAuthRepository via ENV.USE_MOCK_AUTH.
 */
export const backendAuthRepository: AuthRepository = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const session = await authApi.login(credentials);
    await tokenStorage.saveTokens(session.accessToken, session.refreshToken);
    await sessionStorage.save(session);
    return session;
  },

  async logout(): Promise<void> {
    const refresh = await tokenStorage.getRefreshToken();
    if (refresh) {
      await authApi.logout(refresh);
    }
    await tokenStorage.clearTokens();
    await sessionStorage.clear();
  },

  async getSession(): Promise<AuthSession | null> {
    return sessionStorage.get();
  },
};
