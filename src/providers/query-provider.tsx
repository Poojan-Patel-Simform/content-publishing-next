"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { makeQueryClient } from "@/lib/query-client";
import { authKeys } from "@/lib/query-keys";
import { onSessionExpired } from "@/lib/api/auth-events";

const AuthSessionSync = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    return onSessionExpired(() => {
      queryClient.setQueryData(authKeys.me, null);
      router.replace("/login");
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
