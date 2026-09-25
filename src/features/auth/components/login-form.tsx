"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "@/features/auth/schema";
import { useLogin } from "@/features/auth/hooks";
import { applyValidationErrors } from "@/lib/form-errors";
import { AuthFormError } from "@/features/auth/components/auth-form-error";
import { ResendVerificationForm } from "@/features/auth/components/resend-verification-form";
import { isApiError } from "@/lib/api/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSafeReturnTo } from "@/lib/safe-redirect";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [formError, setFormError] = useState<unknown>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [unverifiedAttempt, setUnverifiedAttempt] = useState(0);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    setUnverifiedEmail(null);
    try {
      await login.mutateAsync(values);
      // Only same-origin paths, matching the check in `GuestGuard` — an
      // absolute URL in `returnTo` would be an open redirect.
      const returnTo = searchParams.get("returnTo");
      router.push(isSafeReturnTo(returnTo) ? returnTo : "/dashboard");
    } catch (error) {
      if (!applyValidationErrors(error, setError)) {
        setFormError(error);
        if (isApiError(error) && error.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(values.email);
          setUnverifiedAttempt((attempt) => attempt + 1);
        }
      }
    }
  };

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

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log in"}
      </Button>

      {unverifiedEmail && (
        <div className="border-t pt-4">
          <ResendVerificationForm
            key={unverifiedAttempt}
            defaultEmail={unverifiedEmail}
          />
        </div>
      )}
    </form>
  );
};
