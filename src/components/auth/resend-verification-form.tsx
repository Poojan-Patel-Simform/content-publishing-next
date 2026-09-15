"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema as resendSchema,
  type ForgotPasswordInput as ResendInput,
} from "@/lib/validation/forgot-password.schema";
import { useResendVerification } from "@/hooks/use-resend-verification";
import { applyValidationErrors } from "@/lib/form-errors";
import { AuthFormError } from "@/components/auth/auth-form-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResendVerificationForm() {
  const resendVerification = useResendVerification();
  const [formError, setFormError] = useState<unknown>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResendInput>({ resolver: zodResolver(resendSchema) });

  async function onSubmit(values: ResendInput) {
    setFormError(null);
    try {
      await resendVerification.mutateAsync(values.email);
      setSubmitted(true);
    } catch (error) {
      if (!applyValidationErrors(error, setError)) {
        setFormError(error);
      }
    }
  }

  if (submitted) {
    return (
      <Alert>
        <AlertTitle>Check your inbox</AlertTitle>
        <AlertDescription>
          If that address is registered and unverified, a new verification
          email is on its way.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <AuthFormError error={formError} />
      <div className="space-y-1.5">
        <Label htmlFor="resend-email">Email</Label>
        <Input id="resend-email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <Button type="submit" variant="outline" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Resend verification email"}
      </Button>
    </form>
  );
}
