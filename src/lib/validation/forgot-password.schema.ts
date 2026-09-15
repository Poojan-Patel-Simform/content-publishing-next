import { z } from "zod";
import { emailSchema } from "@/lib/validation/shared";

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
