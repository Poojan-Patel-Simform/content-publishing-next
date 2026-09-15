"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/reset-password.schema";
import { useResetPassword } from "@/hooks/use-reset-password";
import { applyValidationErrors } from "@/lib/form-errors";
import { AuthFormError } from "@/components/auth/auth-form-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const resetPassword = useResetPassword();
  const [formError, setFormError] = useState<unknown>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    try {
      await resetPassword.mutateAsync({ token: values.token, password: values.password });
      setSubmitted(true);
    } catch (error) {
      if (!applyValidationErrors(error, setError)) {
        setFormError(error);
      }
    }
  }

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Invalid link</AlertTitle>
        <AlertDescription>
          This password reset link is missing or invalid. Please request a new
          one.
        </AlertDescription>
      </Alert>
    );
  }

  if (submitted) {
    return (
      <Alert>
        <AlertTitle>Password reset</AlertTitle>
        <AlertDescription>
          Your password has been reset. You can now{" "}
          <a href="/login">log in</a> with your new password.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("token")} />
      <AuthFormError error={formError} />

      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
