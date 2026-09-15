import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/validation/shared";

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(1, "Display name is required").max(120),
});

export type RegisterInput = z.infer<typeof registerSchema>;
