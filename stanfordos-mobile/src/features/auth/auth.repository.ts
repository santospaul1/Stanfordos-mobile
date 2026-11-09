import type { AuthSession, LoginCredentials } from "../../types/auth";

/**
 * Authentication port.
 *
 * Swap the implementation (mock → real backend) without changing
 * screens, navigation, or feature modules.
 */
export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
}
