import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthSession } from "../../types/auth";
import { sessionStorage } from "../../services/session-storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  session: AuthSession | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const savedSession = await sessionStorage.get();

        if (!active) return;

        // Provisional restoration only.
        // A backend session-validation request must be added
        // before this is considered production authentication.
        setSession(savedSession);
        setStatus(
          savedSession ? "authenticated" : "unauthenticated"
        );
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

  const signIn = useCallback(async (newSession: AuthSession) => {
    await sessionStorage.save(newSession);

    setSession(newSession);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(async () => {
    await sessionStorage.clear();

    setSession(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      session,
      status,
      isAuthenticated: status === "authenticated",
      signIn,
      signOut,
    }),
    [session, status, signIn, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}