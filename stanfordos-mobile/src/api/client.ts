import axios from "axios";
import { ENV } from "../config/env";
import { tokenStorage } from "../services/token-storage";

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach the access token to authenticated requests.
apiClient.interceptors.request.use(async (config) => {
  const accessToken = await tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Handle expired sessions.
// Automatic refresh will be implemented after verifying the
// Spring Boot refresh endpoint and its exact response contract.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Do not automatically clear tokens here.
      // A 401 may have different meanings depending on the endpoint.
      // The authentication provider will handle session recovery.
    }

    return Promise.reject(error);
  },
);
