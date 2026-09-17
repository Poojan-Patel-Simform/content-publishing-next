"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

/**
 * Client-side route guard.
 *
 * The API is on a separate origin, so its session cookies are never readable
 * from the Next.js server (see the removed cookie-presence proxy). Auth state
 * therefore has to be resolved in the browser via the `/me` query.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-12">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}

/** Keeps signed-in users off /login and /register. */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Read from `window` rather than `useSearchParams` so this guard can live
      // in a layout without forcing the whole subtree out of prerendering.
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      router.replace(returnTo?.startsWith("/") ? returnTo : "/account");
    }
  }, [isAuthenticated, isLoading, router]);

  return <>{children}</>;
}
