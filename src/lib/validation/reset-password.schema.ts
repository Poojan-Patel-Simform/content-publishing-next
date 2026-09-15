import { z } from "zod";
import { passwordSchema } from "@/lib/validation/shared";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Missing or invalid reset token"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
