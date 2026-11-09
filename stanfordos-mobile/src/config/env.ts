/**
 * Public environment configuration.
 * Never put secrets in EXPO_PUBLIC_* variables.
 *
 * EXPO_PUBLIC_API_URL=https://your-api-domain.com
 * EXPO_PUBLIC_USE_MOCK_AUTH=true
 * EXPO_PUBLIC_USE_MOCK_DATA=false
 */

function flag(name: string, fallback: boolean): boolean {
  const raw = process.env[name];

  if (raw == null || raw.trim() === "") {
    return fallback;
  }

  return ["1", "true", "yes"].includes(raw.toLowerCase());
}

function normalizeApiUrl(value: string): string {
  // API_ENDPOINTS already contains /api/... paths.
  // Remove a trailing /api to prevent /api/api/... requests.
  return value
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");
}

const rawApiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? "https://your-api-domain.com";

export const ENV = {
  API_URL: normalizeApiUrl(rawApiUrl),

  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME ?? "Stanfordos",

  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT ?? "development",

  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENVIRONMENT === "production",

  USE_MOCK_AUTH: flag("EXPO_PUBLIC_USE_MOCK_AUTH", true),

  USE_MOCK_DATA: flag("EXPO_PUBLIC_USE_MOCK_DATA", true),
};
