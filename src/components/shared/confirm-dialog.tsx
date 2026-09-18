"use client";

import { ApiErrorMessage } from "@/components/shared/api-error-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Controlled confirm dialog for the destructive/irreversible actions
 * (submit, archive, unpublish, publish now).
 *
 * `error` and `isPending` are surfaced here rather than on the page behind it,
 * so a failed action explains itself without the dialog closing first and
 * losing the user's place.
 */
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isPending?: boolean;
  error?: unknown;
  /** Override the default code -> message map, e.g. to show a 409 verbatim. */
  errorMessages?: Record<string, string>;
  onConfirm: () => void;
  /** Extra fields shown above the buttons (a comment box, a date picker). */
  children?: React.ReactNode;
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  isPending = false,
  error,
  errorMessages,
  onConfirm,
  children,
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        {error ? <ApiErrorMessage error={error} messages={errorMessages} /> : null}

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose render={<Button variant="outline" disabled={isPending} />}>
            {cancelLabel}
          </DialogClose>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
