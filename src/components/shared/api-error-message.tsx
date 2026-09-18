import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiError } from "@/lib/api/api-error";

/**
 * The content-surface generalization of `components/auth/auth-form-error.tsx`.
 * That one stays put: its `UNAUTHORIZED` copy ("Invalid email or password")
 * is login-specific and would be wrong anywhere else.
 */
const CODE_MESSAGES: Record<string, string> = {
  NOT_FOUND: "Not found, or you don't have access to it.",
  CONFLICT: "This item changed — refresh and try again.",
  FORBIDDEN: "You don't have permission to do that.",
  EMAIL_NOT_VERIFIED:
    "Verify your email address before writing or reviewing content.",
  UNAUTHORIZED: "Your session has expired. Log in again to continue.",
  TOO_MANY_REQUESTS: "Too many attempts, try again shortly.",
  VALIDATION_ERROR: "Some fields need fixing before this can be saved.",
  PAYLOAD_TOO_LARGE: "That content is too large to save.",
  SERVICE_UNAVAILABLE: "The service is temporarily unavailable. Try again shortly.",
  NETWORK_ERROR: "Could not reach the server. Check your connection and try again.",
};

export const apiErrorMessage = (
  error: unknown,
  messages?: Record<string, string>
): string => {
  if (error instanceof ApiError) {
    return { ...CODE_MESSAGES, ...messages }[error.code] ?? error.message;
  }
  return "Something went wrong. Please try again.";
};

interface ApiErrorMessageProps {
  error: unknown;
  title?: string;
  /** Override or extend the default code -> message map for this context. */
  messages?: Record<string, string>;
  /** A way out of the error — a link back, a retry — shown under the message. */
  children?: React.ReactNode;
}

export const ApiErrorMessage = ({
  error,
  title = "Error",
  messages,
  children,
}: ApiErrorMessageProps) => {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {apiErrorMessage(error, messages)}
        {children}
      </AlertDescription>
    </Alert>
  );
};
