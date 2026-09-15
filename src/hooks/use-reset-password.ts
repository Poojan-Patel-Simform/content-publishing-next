"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      authApi.resetPassword(input),
  });
}
