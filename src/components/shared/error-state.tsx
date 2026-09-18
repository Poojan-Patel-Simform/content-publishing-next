"use client";

import { ApiErrorMessage } from "@/components/shared/api-error-message";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  messages?: Record<string, string>;
}

export const ErrorState = ({
  error,
  onRetry,
  title = "Something went wrong",
  messages,
}: ErrorStateProps) => {
  return (
    <div className="space-y-4">
      <ApiErrorMessage error={error} title={title} messages={messages} />
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};
