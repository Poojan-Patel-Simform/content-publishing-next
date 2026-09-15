"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/forgot-password.schema";
import { useForgotPassword } from "@/hooks/use-forgot-password";
import { applyValidationErrors } from "@/lib/form-errors";
import { AuthFormError } from "@/components/auth/auth-form-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [formError, setFormError] = useState<unknown>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);
    try {
      await forgotPassword.mutateAsync(values.email);
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
          If that address is registered, check your inbox for further
          instructions to reset your password.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <AuthFormError error={formError} />

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
