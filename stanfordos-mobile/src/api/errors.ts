export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    options?: { code?: string; details?: unknown }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  // Axios-shaped error
  const anyErr = error as {
    response?: { status?: number; data?: any };
    message?: string;
    code?: string;
  };

  const status = anyErr.response?.status ?? 0;
  const data = anyErr.response?.data;

  if (status === 401) {
    return new ApiError(
      data?.message ?? "Session expired. Please sign in again.",
      401,
      { code: "UNAUTHORIZED", details: data }
    );
  }
  if (status === 403) {
    return new ApiError(
      data?.message ?? "You do not have permission for this action.",
      403,
      { code: "FORBIDDEN", details: data }
    );
  }
  if (status === 404) {
    return new ApiError(data?.message ?? "Not found.", 404, {
      code: "NOT_FOUND",
      details: data,
    });
  }
  if (status >= 500) {
    return new ApiError(
      data?.message ?? "Server error. Try again shortly.",
      status,
      { code: "SERVER", details: data }
    );
  }

  if (anyErr.message === "Network Error" || anyErr.code === "ERR_NETWORK") {
    return new ApiError("Network error. Check your connection.", 0, {
      code: "NETWORK",
    });
  }

  const message =
    (typeof data?.message === "string" && data.message) ||
    anyErr.message ||
    "Something went wrong.";

  return new ApiError(message, status || 0, { details: data });
}
