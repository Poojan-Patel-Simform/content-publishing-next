"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoginForm } from "@/features/auth/components/login-form";
import { GoogleAuthLink } from "@/features/auth/components/google-auth-link";

const LoginPage = () => {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
};

const LoginPageContent = () => {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const returnTo = searchParams.get("returnTo") ?? "/account";

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      {oauthError === "account_exists_unverified" && (
        <Alert variant="destructive">
          <AlertTitle>Account not verified</AlertTitle>
          <AlertDescription>
            An account with this email already exists but is unverified.
            Please check your inbox or log in with your password.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Welcome back. Enter your details to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <div className="relative text-center text-sm text-muted-foreground">
            <span className="bg-card px-2">or</span>
          </div>
          <GoogleAuthLink returnTo={returnTo} />
        </CardContent>
      </Card>

      <div className="flex justify-between text-sm text-muted-foreground">
        <Link href="/forgot-password" className="underline underline-offset-4">
          Forgot password?
        </Link>
        <Link href="/register" className="underline underline-offset-4">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
