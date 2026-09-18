"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MailWarning, ShieldAlert } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * The persistent "verify your email" banner.
 *
 * Driven by `emailVerifiedAt` from `/me` rather than by catching a 403 from an
 * `/items` or `/editorial` call. The two are the same condition — the API's
 * `requireVerifiedEmail` 403s exactly when `emailVerifiedAt` is null (api.md
 * "Authentication") — but reading it from the session means the warning is up
 * *before* the user loses work to a rejected save, and it survives a page load
 * that happens to make no content call at all.
 */
export const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || user.emailVerifiedAt !== null) return null;
  // No point nagging on the page that fixes it.
  if (pathname === "/verify-email") return null;
  // A suspended account gets the blocking notice instead; two warnings stacked
  // would just bury the one that actually explains the lockout.
  if (user.status === "SUSPENDED") return null;

  return (
    <div className="border-b bg-amber-50 dark:bg-amber-500/10">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-4 py-2.5">
        <MailWarning className="size-4 shrink-0 text-amber-700 dark:text-amber-300" />
        <p className="text-sm text-amber-900 dark:text-amber-100">
          Verify your email address to write, submit or review content.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          render={<Link href="/verify-email" />}
        >
          Resend verification email
        </Button>
      </div>
    </div>
  );
};

/**
 * Blocks the authoring surface for a suspended account.
 *
 * The API refuses `/items` and `/editorial` outright for these users
 * (`requireActiveAccount`), so without this the dashboard would just render an
 * empty list and leave them guessing. `/account` stays reachable: suspension
 * shouldn't trap someone out of changing their own password or signing out.
 */
interface AccountStatusGateProps {
  children: React.ReactNode;
}

export const AccountStatusGate = ({ children }: AccountStatusGateProps) => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || user.status !== "SUSPENDED" || pathname === "/account") {
    return <>{children}</>;
  }

  return (
    <Alert variant="destructive">
      <ShieldAlert />
      <AlertTitle>This account is suspended</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          You can&apos;t read, write or review content while the account is
          suspended. Everything you&apos;ve written is still here — nothing has
          been deleted. Contact an administrator to have it restored.
        </p>
        <Button variant="outline" size="sm" render={<Link href="/account" />}>
          Go to account settings
        </Button>
      </AlertDescription>
    </Alert>
  );
};
