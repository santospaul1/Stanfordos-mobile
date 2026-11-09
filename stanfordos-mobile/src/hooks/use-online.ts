import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight online indicator.
 * Prefer @react-native-community/netinfo in production builds;
 * this uses the browser/native NetInfo when available and falls back to true.
 */
export function useOnline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // React Native / Expo web
    const nav =
      typeof navigator !== "undefined"
        ? (navigator as { onLine?: boolean })
        : null;

    if (nav && typeof nav.onLine === "boolean") {
      setOnline(nav.onLine);
      const on = () => setOnline(true);
      const off = () => setOnline(false);
      window.addEventListener?.("online", on);
      window.addEventListener?.("offline", off);
      return () => {
        window.removeEventListener?.("online", on);
        window.removeEventListener?.("offline", off);
      };
    }

    setOnline(true);
  }, []);

  const requireOnline = useCallback(() => {
    if (!online) {
      throw new Error(
        "You are offline. Attendance can only be saved while connected."
      );
    }
  }, [online]);

  return { online, requireOnline };
}
