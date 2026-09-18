import { apiGet, apiPost, REFRESH_URL } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/types";
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
} from "@/features/auth/schema";

export const authApi = {
  register: (input: RegisterInput) => apiPost<void>("/auth/register", input),

  verifyEmail: (token: string) =>
    apiPost<{ user: AuthUser }>("/auth/verify-email", { token }),

  resendVerification: (email: string) =>
    apiPost<void>("/auth/resend-verification", { email }),

  login: (input: LoginInput) => apiPost<{ user: AuthUser }>("/auth/login", input),

  refresh: () => apiPost<{ user: AuthUser }>(REFRESH_URL),

  logout: () => apiPost<void>("/auth/logout"),

  logoutAll: () => apiPost<void>("/auth/logout-all"),

  me: () => apiGet<{ user: AuthUser }>("/auth/me"),

  forgotPassword: (email: string) => apiPost<void>("/auth/forgot-password", { email }),

  resetPassword: (input: { token: string; password: string }) =>
    apiPost<{ message: string }>("/auth/reset-password", input),

  changePassword: (input: ChangePasswordInput) =>
    apiPost<void>("/auth/change-password", input),
};
