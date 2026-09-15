"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { isApiError } from "@/lib/api/api-error";
import { authKeys } from "@/lib/query-keys";
import type { AuthUser } from "@/lib/api/types";

export function useAuth() {
  const meQuery = useQuery<AuthUser | null>({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        const { user } = await authApi.me();
        return user;
      } catch (error) {
        if (isApiError(error) && error.status === 401) return null;
        throw error;
      }
    },
  });

  return {
    user: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    isAuthenticated: !!meQuery.data,
    error: meQuery.error,
    refetch: meQuery.refetch,
  };
}
