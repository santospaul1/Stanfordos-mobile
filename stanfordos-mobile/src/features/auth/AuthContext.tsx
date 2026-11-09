import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthSession, LoginCredentials } from "../../types/auth";
import type { AuthRepository } from "./auth.repository";
import { mockAuthRepository } from "./mock-auth.repository";
import { backendAuthRepository } from "./backend-auth.repository";
import { ENV } from "../../config/env";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  session: AuthSession | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isMockAuth: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  /** @deprecated use login() */
  signIn: (session: AuthSession) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const authRepository: AuthRepository = ENV.USE_MOCK_AUTH
  ? mockAuthRepository
  : backendAuthRepository;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const saved = await authRepository.getSession();
        if (!active) return;
        setSession(saved);
        setStatus(saved ? "authenticated" : "unauthenticated");
      } catch {
        if (!active) return;
        setSession(null);
        setStatus("unauthenticated");
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const next = await authRepository.login(credentials);
    setSession(next);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(async () => {
    await authRepository.logout();
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  const signIn = useCallback(async (newSession: AuthSession) => {
    setSession(newSession);
    setStatus("authenticated");
  }, []);

  const value = useMemo(
    () => ({
      session,
      status,
      isAuthenticated: status === "authenticated",
      isMockAuth: ENV.USE_MOCK_AUTH,
      login,
      signOut,
      signIn,
    }),
    [session, status, login, signOut, signIn]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
