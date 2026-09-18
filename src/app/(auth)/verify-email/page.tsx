"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthFormError } from "@/features/auth/components/auth-form-error";
import { ResendVerificationForm } from "@/features/auth/components/resend-verification-form";
import { useVerifyEmail } from "@/features/auth/hooks";

const VerifyEmailPage = () => {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageContent />
    </Suspense>
  );
};

const VerifyEmailPageContent = () => {
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
            <Alert>
              <AlertTitle>Send yourself a new link</AlertTitle>
              <AlertDescription>
                Open the link from your verification email to finish. Lost it,
                or has it expired? Request a fresh one below.
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
};

export default VerifyEmailPage;
