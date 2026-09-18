import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiError } from "@/lib/api/api-error";

const CODE_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Invalid email or password.",
  FORBIDDEN: "This account has been suspended.",
  EMAIL_NOT_VERIFIED: "Please verify your email address before logging in.",
  CONFLICT: "This resource already exists.",
  TOO_MANY_REQUESTS: "Too many attempts, try again shortly.",
  BAD_REQUEST: "This link is invalid or has expired.",
  NETWORK_ERROR: "Could not reach the server. Check your connection and try again.",
};

interface Props {
  error: unknown;
  /** Override or extend the default code -> message mapping for this form's context. */
  messages?: Record<string, string>;
}

export const AuthFormError = ({ error, messages }: Props) => {
  if (!error) return null;

  const message =
    error instanceof ApiError
      ? { ...CODE_MESSAGES, ...messages }[error.code] ?? error.message
      : "Something went wrong. Please try again.";

  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
