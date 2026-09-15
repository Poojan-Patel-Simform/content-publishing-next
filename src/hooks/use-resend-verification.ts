"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });
}
