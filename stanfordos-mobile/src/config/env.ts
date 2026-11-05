const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is missing. Configure your .env file.");
}

export const ENV = {
  API_URL: apiUrl.replace(/\/$/, ""),
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME ?? "Stanfordos",
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT ?? "development",
  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENVIRONMENT === "production",
};
