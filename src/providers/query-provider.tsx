"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { makeQueryClient } from "@/lib/query-client";
import { authKeys } from "@/lib/query-keys";
import { onSessionExpired } from "@/lib/api/auth-events";
import type { AuthUser } from "@/lib/api/types";

const AuthSessionSync = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    return onSessionExpired(() => {
      const previousUser = queryClient.getQueryData<AuthUser | null>(authKeys.me);
      queryClient.setQueryData(authKeys.me, null);
      // A visitor who never signed in also lands here (the `/me` probe 401s and
      // the refresh fails). They may keep reading the public surface; only a
      // session that actually expired is sent to /login. Protected routes are
      // still redirected by `AuthGuard`.
      if (previousUser) router.replace("/login");
    });
  }, [queryClient, router]);

  return null;
};

interface Props {
  children: React.ReactNode;
}

export const QueryProvider = ({ children }: Props) => {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionSync />
      {children}
    </QueryClientProvider>
  );
};
