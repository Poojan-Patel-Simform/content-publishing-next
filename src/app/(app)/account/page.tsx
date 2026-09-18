"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { useLogout, useLogoutAll, useAuth } from "@/features/auth/hooks";

const AccountPage = () => {
  const { user, isLoading } = useAuth();
  const logout = useLogout();
  const logoutAll = useLogoutAll();

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-md flex-1 space-y-6 px-4 py-12"
        aria-hidden
      >
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            {user ? `${user.displayName} (${user.email})` : "Not signed in"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? "Logging out..." : "Log out"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => logoutAll.mutate()}
            disabled={logoutAll.isPending}
          >
            {logoutAll.isPending ? "Logging out..." : "Log out all devices"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            This will sign you out of all other sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
