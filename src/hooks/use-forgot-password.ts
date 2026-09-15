"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}
