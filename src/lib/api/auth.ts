import { apiGet, apiPost } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/types";
import type { ChangePasswordInput } from "@/lib/validation/change-password.schema";
import type { LoginInput } from "@/lib/validation/login.schema";
import type { RegisterInput } from "@/lib/validation/register.schema";

export const authApi = {
  register: (input: RegisterInput) => apiPost<void>("/register", input),

  verifyEmail: (token: string) =>
    apiPost<{ user: AuthUser }>("/verify-email", { token }),

  resendVerification: (email: string) =>
    apiPost<void>("/resend-verification", { email }),

  login: (input: LoginInput) => apiPost<{ user: AuthUser }>("/login", input),

  refresh: () => apiPost<{ user: AuthUser }>("/refresh"),

  logout: () => apiPost<void>("/logout"),

  logoutAll: () => apiPost<void>("/logout-all"),

  me: () => apiGet<{ user: AuthUser }>("/me"),

  forgotPassword: (email: string) => apiPost<void>("/forgot-password", { email }),

  resetPassword: (input: { token: string; password: string }) =>
    apiPost<{ message: string }>("/reset-password", input),

  changePassword: (input: ChangePasswordInput) =>
    apiPost<void>("/change-password", input),
};
