"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { authKeys } from "@/lib/query-keys";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      router.replace("/login");
    },
  });
}

export function useLogoutAll() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      router.replace("/login");
    },
  });
}
