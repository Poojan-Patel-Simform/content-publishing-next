"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { authKeys } from "@/lib/query-keys";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}
