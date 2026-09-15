"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthFormError } from "@/components/auth/auth-form-error";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { useVerifyEmail } from "@/hooks/use-verify-email";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const verifyEmail = useVerifyEmail();
  const attempted = useRef(false);
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (attempted.current || !token) return;
    attempted.current = true;

    verifyEmail.mutate(token, {
      onSuccess: () => setStatus("success"),
      onError: (err) => {
        setError(err);
        setStatus("error");
      },
    });
  }, [token, verifyEmail]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>Confirming your email address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!token && (
            <Alert variant="destructive">
              <AlertTitle>Missing token</AlertTitle>
              <AlertDescription>
                This verification link is missing its token. Please use the
                link from your email, or request a new one below.
              </AlertDescription>
            </Alert>
          )}
          {!token && <ResendVerificationForm />}

          {token && status === "pending" && (
            <p className="text-sm text-muted-foreground">Verifying...</p>
          )}

          {status === "success" && (
            <Alert>
              <AlertTitle>Email verified</AlertTitle>
              <AlertDescription>
                Your email has been verified. You can now{" "}
                <Link href="/login">log in</Link>.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <AuthFormError error={error} />
              <ResendVerificationForm />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
