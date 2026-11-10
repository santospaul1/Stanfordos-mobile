function flag(name: string, fallback: boolean): boolean {
  const raw = process.env[name];

  if (raw == null || raw.trim() === "") {
    return fallback;
  }

  return ["1", "true", "yes"].includes(raw.toLowerCase());
}

function normalizeApiUrl(value: string): string {
  return value
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");
}

export const ENV = {
  API_URL: normalizeApiUrl(
    process.env.EXPO_PUBLIC_API_URL ?? "https://stanfordos.co.ke",
  ),

  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME ?? "Stanfordos",

  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT ?? "development",

  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENVIRONMENT === "production",

  USE_MOCK_AUTH: flag("EXPO_PUBLIC_USE_MOCK_AUTH", true),

  USE_MOCK_DATA: flag("EXPO_PUBLIC_USE_MOCK_DATA", true),
};
