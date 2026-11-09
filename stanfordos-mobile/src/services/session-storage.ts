import * as SecureStore from "expo-secure-store";
import type { AuthSession } from "../types/auth";

const SESSION_KEY = "stanfordos_auth_session";

export const sessionStorage = {
  async save(session: AuthSession): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },

  async get(): Promise<AuthSession | null> {
    const stored = await SecureStore.getItemAsync(SESSION_KEY);

    if (!stored) {
      return null;
    }

    try {
      const session = JSON.parse(stored) as AuthSession;

      if (
        !session.accessToken ||
        !session.refreshToken ||
        !session.user?.id ||
        !session.user?.role ||
        !session.user?.schoolId
      ) {
        await this.clear();
        return null;
      }

      if (!session.tenant) {
        session.tenant = null;
      }

      return session;
    } catch {
      await this.clear();
      return null;
    }
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
