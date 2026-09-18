import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "@/lib/api/api-error";
import { emitSessionExpired } from "@/lib/api/auth-events";
import type { ApiEnvelope, AuthUser } from "@/lib/api/types";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retried?: boolean;
  }
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

/** Relative to `baseURL`; shared so the refresh guard and `authApi` can't drift. */
export const REFRESH_URL = "/auth/refresh";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const toApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiEnvelope<unknown> | undefined;
    if (body && body.success === false) {
      return new ApiError(body.error, error.response?.status);
    }
    return new ApiError(
      {
        code: "NETWORK_ERROR",
        message: error.message || "Network error",
        requestId: "",
      },
      error.response?.status
    );
  }
  if (error instanceof ApiError) return error;
  return new ApiError({
    code: "UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : "Unknown error",
    requestId: "",
  });
};

/**
 * The response interceptor below unwraps the `{ success, data }` envelope, so
 * every resolved axios call actually yields the inner payload at runtime even
 * though axios's own types still say `AxiosResponse<T>`. These helpers give
 * callers (auth.ts, the refresh logic below) an honest `Promise<T>` type.
 */
export const apiGet = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.get(url, config) as unknown as Promise<T>;
};

export const apiPost = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiClient.post(url, data, config) as unknown as Promise<T>;
};

export const apiPatch = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiClient.patch(url, data, config) as unknown as Promise<T>;
};

export const apiDelete = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiClient.delete(url, config) as unknown as Promise<T>;
};

let refreshPromise: Promise<AuthUser> | null = null;

const performRefresh = async (): Promise<AuthUser> => {
  if (!refreshPromise) {
    refreshPromise = apiPost<{ user: AuthUser }>(REFRESH_URL)
      .then((data) => data.user)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => {
    // 204 carries no envelope to unwrap (logout, unpublish, change-password,
    // cancel-schedule and archive all return it).
    if (response.status === 204) return undefined as unknown as AxiosResponse;

    const body = response.data as ApiEnvelope<unknown>;
    if (body && body.success === false) {
      throw new ApiError(body.error, response.status);
    }
    const unwrapped = body?.success ? body.data : body;
    return unwrapped as unknown as AxiosResponse;
  },
  async (error) => {
    const config = error?.config as InternalAxiosRequestConfig | undefined;
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const apiErr = toApiError(error);

    const isRefreshCall = config?.url === REFRESH_URL;

    if (status === 401 && config && !isRefreshCall && !config._retried) {
      config._retried = true;
      try {
        if (apiErr.code === "REFRESH_IN_FLIGHT") {
          if (refreshPromise) {
            await refreshPromise;
          }
        } else {
          await performRefresh();
        }
        return await apiClient(config);
      } catch (refreshError) {
        emitSessionExpired();
        throw toApiError(refreshError);
      }
    }

    throw apiErr;
  }
);
