import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api/api-error";

/**
 * Maps a VALIDATION_ERROR's field-level `details` onto react-hook-form fields.
 * Returns true if the error was a validation error (and was applied to fields),
 * false otherwise — callers should fall back to a generic <AuthFormError> banner.
 */
export function applyValidationErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.code !== "VALIDATION_ERROR" || !error.details) return false;

  for (const [field, messages] of Object.entries(error.details)) {
    if (messages?.[0]) {
      setError(field as Path<T>, { message: messages[0] });
    }
  }
  return true;
}
