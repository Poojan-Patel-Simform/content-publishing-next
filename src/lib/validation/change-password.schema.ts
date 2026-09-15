import { z } from "zod";
import { passwordSchema } from "@/lib/validation/shared";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormInput = z.infer<typeof changePasswordSchema>;
export type ChangePasswordInput = { currentPassword: string; newPassword: string };
