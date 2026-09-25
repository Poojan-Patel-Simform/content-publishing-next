"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/features/auth/schema";
import { useRegister } from "@/features/auth/hooks";
import { applyValidationErrors } from "@/lib/form-errors";
import { AuthFormError } from "@/features/auth/components/auth-form-error";
import { ResendVerificationForm } from "@/features/auth/components/resend-verification-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const RegisterForm = () => {
  const registerMutation = useRegister();
  const [formError, setFormError] = useState<unknown>(null);
  const [submitted, setSubmitted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);
    try {
      await registerMutation.mutateAsync(values);
      setRegisteredEmail(values.email);
      setSubmitted(true);
    } catch (error) {
      if (!applyValidationErrors(error, setError)) {
        setFormError(error);
      }
    }
  };

  if (submitted) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription>
            If that address is registered, check your inbox for further
            instructions to verify your account.
          </AlertDescription>
        </Alert>
        <div className="border-t pt-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Didn&apos;t get the email?
          </p>
          <ResendVerificationForm defaultEmail={registeredEmail ?? undefined} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <AuthFormError error={formError} />

      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" autoComplete="name" {...register("displayName")} />
        {errors.displayName && (
          <p className="text-sm text-destructive">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};
