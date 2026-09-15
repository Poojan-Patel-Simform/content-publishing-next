"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}
