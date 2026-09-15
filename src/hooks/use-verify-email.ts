"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { authKeys } from "@/lib/query-keys";

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}
