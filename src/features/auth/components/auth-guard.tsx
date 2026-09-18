"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks";
import type { UserRole } from "@/lib/api/types";
import { isSafeReturnTo } from "@/lib/safe-redirect";
import { Skeleton } from "@/components/ui/skeleton";

/** Shared placeholder while `/me` resolves, so a guard never flashes content. */
export const RouteLoading = () => {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8" aria-hidden>
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2 pt-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
};

/**
 * Client-side route guard.
 *
 * The API is on a separate origin, so its session cookies are never readable
 * from the Next.js server (see the removed cookie-presence proxy). Auth state
 * therefore has to be resolved in the browser via the `/me` query.
 */
interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return <RouteLoading />;
  }

  return <>{children}</>;
};

/** Keeps signed-in users off /login and /register. */
interface GuestGuardProps {
  children: React.ReactNode;
}

export const GuestGuard = ({ children }: GuestGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Being signed in and unverified is a real state, and /verify-email is the
  // one route in this group that such a user still needs — the AppShell banner
  // sends them here. Bouncing them to /dashboard would make that link dead.
  const needsVerification =
    pathname === "/verify-email" && !!user && user.emailVerifiedAt === null;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !needsVerification) {
      // Read from `window` rather than `useSearchParams` so this guard can live
      // in a layout without forcing the whole subtree out of prerendering.
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      router.replace(isSafeReturnTo(returnTo) ? returnTo : "/dashboard");
    }
  }, [isAuthenticated, isLoading, needsVerification, router]);

  return <>{children}</>;
};

/**
 * Role gate for the editorial surface. Assumes an `AuthGuard` above it has
 * already established a session — this only decides *which* signed-in users
 * may proceed. Server-side `requireEditor` remains authoritative; this just
 * saves the user a guaranteed-403 round trip.
 */
interface RoleGuardProps {
  role: UserRole;
  children: React.ReactNode;
}

export const RoleGuard = ({ role, children }: RoleGuardProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const allowed = user?.role === role;

  useEffect(() => {
    if (!isLoading && user && !allowed) {
      router.replace("/dashboard");
    }
  }, [allowed, isLoading, router, user]);

  if (isLoading || !allowed) {
    return <RouteLoading />;
  }

  return <>{children}</>;
};
