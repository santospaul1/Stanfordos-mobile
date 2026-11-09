import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { ENV } from "../config/env";
import { tokenStorage } from "../services/token-storage";
import { sessionStorage } from "../services/session-storage";

import { normalizeApiError } from "./errors";
import { API_ENDPOINTS } from "./endpoints";

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 25000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStorage.getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const { data } = await axios.post(
      `${ENV.API_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
      { refreshToken },
      {
        timeout: 20000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    const accessToken: string | undefined =
      data?.accessToken ?? data?.access_token;

    const nextRefreshToken: string =
      data?.refreshToken ?? data?.refresh_token ?? refreshToken;

    if (!accessToken) {
      throw new Error("Refresh response did not contain an access token.");
    }

    await tokenStorage.saveTokens(accessToken, nextRefreshToken);

    return accessToken;
  } catch {
    await Promise.all([tokenStorage.clearTokens(), sessionStorage.clear()]);

    return null;
  }
}

function singleFlightRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

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

    const requestUrl = original?.url ?? "";

    const isAuthRequest =
      requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      requestUrl.includes(API_ENDPOINTS.AUTH.REFRESH);

    if (status === 401 && original && !original._retry && !isAuthRequest) {
      original._retry = true;

      const newToken = await singleFlightRefresh();

      if (newToken) {
        original.headers = original.headers ?? {};

        original.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(original);
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

/**
 * Typed API helpers.
 * Return response.data, not the Axios response wrapper.
 */

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
