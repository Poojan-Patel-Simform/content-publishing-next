"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordFormInput,
} from "@/lib/validation/change-password.schema";
import { useChangePassword } from "@/hooks/use-change-password";
import { applyValidationErrors } from "@/lib/form-errors";
import { AuthFormError } from "@/components/auth/auth-form-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const [formError, setFormError] = useState<unknown>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordFormInput) {
    setFormError(null);
    setSuccess(false);
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccess(true);
      reset();
    } catch (error) {
      if (!applyValidationErrors(error, setError)) {
        setFormError(error);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <AuthFormError
        error={formError}
        messages={{ UNAUTHORIZED: "Current password is incorrect." }}
      />
      {success && (
        <Alert>
          <AlertTitle>Password updated</AlertTitle>
          <AlertDescription>
            Your password has been changed. Other sessions have been signed out.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
