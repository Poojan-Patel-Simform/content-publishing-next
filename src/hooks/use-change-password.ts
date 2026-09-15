"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import type { ChangePasswordInput } from "@/lib/validation/change-password.schema";

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => authApi.changePassword(input),
  });
}
