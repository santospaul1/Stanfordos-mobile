import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { ENV } from "../config/env";
import { tokenStorage } from "../services/token-storage";
import { normalizeApiError } from "./errors";
import { API_ENDPOINTS } from "./endpoints";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(
      `${ENV.API_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
      { refreshToken },
      { timeout: 20000, headers: { Accept: "application/json" } }
    );

    const accessToken: string | undefined =
      data?.accessToken ?? data?.access_token;
    const nextRefresh: string | undefined =
      data?.refreshToken ?? data?.refresh_token ?? refreshToken;

    if (!accessToken) return null;

    await tokenStorage.saveTokens(accessToken, nextRefresh ?? refreshToken);
    return accessToken;
  } catch {
    await tokenStorage.clearTokens();
    return null;
  }
}

function singleFlightRefresh() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await tokenStorage.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      const newToken = await singleFlightRefresh();
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);

/** Typed helper — returns response.data and throws ApiError */
export async function apiGet<T>(url: string, params?: object): Promise<T> {
  const { data } = await apiClient.get<T>(url, { params });
  return data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.post<T>(url, body);
  return data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.put<T>(url, body);
  return data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.patch<T>(url, body);
  return data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await apiClient.delete<T>(url);
  return data;
}
