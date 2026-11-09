/**
 * Public env only. Never put secrets in EXPO_PUBLIC_*.
 *
 * EXPO_PUBLIC_API_URL=https://stanfordos.co.ke/api
 * EXPO_PUBLIC_USE_MOCK_AUTH=true
 * EXPO_PUBLIC_USE_MOCK_DATA=true
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "https://stanfordos.co.ke/api";

function flag(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  return raw === "1" || raw.toLowerCase() === "true";
}

export const ENV = {
  API_URL: apiUrl.replace(/\/$/, ""),
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME ?? "Stanfordos",
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT ?? "development",
  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENVIRONMENT === "production",
  /**
   * When true, AuthContext uses MockAuthRepository.
   * Set false once tenant-aware backend login is ready.
   */
  USE_MOCK_AUTH: flag("EXPO_PUBLIC_USE_MOCK_AUTH", true),
  /**
   * When true, feature screens use mock-* services.
   * Flip modules to API clients gradually.
   */
  USE_MOCK_DATA: flag("EXPO_PUBLIC_USE_MOCK_DATA", true),
};
