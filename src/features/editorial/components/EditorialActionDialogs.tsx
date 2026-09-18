import { describeSchedule } from "@/lib/content-display";
import type { useEditorialActions } from "@/features/editorial/components/EditorialActions.hooks";
import { CONFLICT_MESSAGES } from "@/features/editorial/components/EditorialActions.hooks";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const COMMENT_MAX_LENGTH = 2000;

interface CommentFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string | null;
  onChange: (value: string) => void;
}

const CommentField = ({
  id,
  label,
  placeholder,
  value,
  error,
  onChange,
}: CommentFieldProps) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        rows={3}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export type EditorialActionsState = ReturnType<typeof useEditorialActions>;

export interface EditorialActionDialogsProps {
  state: EditorialActionsState;
  scheduledFor?: string | null;
  itemId: string;
}

/** The six confirmation dialogs behind the editorial action buttons. */
export const EditorialActionDialogs = ({
  state,
  scheduledFor,
  itemId,
}: EditorialActionDialogsProps) => {
  const {
    dialog,
    setDialog,
    close,
    comment,
    onCommentChange,
    rejectError,
    onRejectCommentChange,
    scheduleAt,
    scheduleFloor,
    scheduleError,
    onScheduleAtChange,
    trimmedComment,
    versionId,
    approve,
    reject,
    publish,
    schedule,
    cancelSchedule,
    unpublish,
    run,
    onConfirmReject,
    onConfirmSchedule,
  } = state;

  return (
    <>
      <ConfirmDialog
        open={dialog === "approve"}
        onOpenChange={(open) => (open ? setDialog("approve") : close())}
        title="Approve this version?"
        description="It moves to Approved and can then be published now or scheduled."
        confirmLabel="Approve"
        isPending={approve.isPending}
        error={approve.error}
        errorMessages={CONFLICT_MESSAGES}
        onConfirm={() =>
          run(() =>
            approve.mutateAsync({
              versionId,
              ...(trimmedComment ? { comment: trimmedComment } : {}),
            })
          )
        }
      >
        <CommentField
          id="approve-comment"
          label="Comment (optional)"
          placeholder="Reads well — good to go."
          value={comment}
          onChange={onCommentChange}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "reject"}
        onOpenChange={(open) => (open ? setDialog("reject") : close())}
        title="Send this back for changes?"
        description="The author can edit the version and resubmit it. Tell them what needs to change."
        confirmLabel="Reject"
        destructive
        isPending={reject.isPending}
        error={reject.error}
        errorMessages={CONFLICT_MESSAGES}
        onConfirm={onConfirmReject}
      >
        <CommentField
          id="reject-comment"
          label="Comment (required)"
          placeholder="Please add a source for the Q2 numbers."
          value={comment}
          error={rejectError}
          onChange={onRejectCommentChange}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "publish"}
        onOpenChange={(open) => (open ? setDialog("publish") : close())}
        title="Publish this version now?"
        description="It becomes the live version immediately and replaces whatever is published today."
        confirmLabel="Publish"
        isPending={publish.isPending}
        error={publish.error}
        errorMessages={CONFLICT_MESSAGES}
        onConfirm={() =>
          run(() =>
            publish.mutateAsync({
              versionId,
              ...(trimmedComment ? { comment: trimmedComment } : {}),
            })
          )
        }
      >
        <CommentField
          id="publish-comment"
          label="Comment (optional)"
          placeholder="Publishing ahead of the launch."
          value={comment}
          onChange={onCommentChange}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "schedule"}
        onOpenChange={(open) => (open ? setDialog("schedule") : close())}
        title="Schedule this version"
        description="A worker publishes it at the chosen time. Nothing changes publicly until then."
        confirmLabel="Schedule"
        isPending={schedule.isPending}
        error={schedule.error}
        errorMessages={CONFLICT_MESSAGES}
        onConfirm={onConfirmSchedule}
      >
        <div className="space-y-1.5">
          <Label htmlFor="schedule-at">Publish at</Label>
          <Input
            id="schedule-at"
            type="datetime-local"
            value={scheduleAt}
            min={scheduleFloor}
            aria-invalid={!!scheduleError}
            onChange={(event) => onScheduleAtChange(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your local time. The item stays invisible to readers until it fires.
          </p>
          {scheduleError && (
            <p className="text-sm text-destructive">{scheduleError}</p>
          )}
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "cancelSchedule"}
        onOpenChange={(open) => (open ? setDialog("cancelSchedule") : close())}
        title="Cancel the scheduled publish?"
        description={
          scheduledFor
            ? `${describeSchedule(scheduledFor)}. Cancelling returns the version to Approved — you can publish or reschedule it later.`
            : "The version returns to Approved — you can publish or reschedule it later."
        }
        confirmLabel="Cancel schedule"
        cancelLabel="Keep it scheduled"
        isPending={cancelSchedule.isPending}
        error={cancelSchedule.error}
        errorMessages={CONFLICT_MESSAGES}
        onConfirm={() => run(() => cancelSchedule.mutateAsync(versionId))}
      />

      <ConfirmDialog
        open={dialog === "unpublish"}
        onOpenChange={(open) => (open ? setDialog("unpublish") : close())}
        title="Unpublish this item?"
        description="It's hidden from the public, not deleted. Every version stays in the history and it can be published again."
        confirmLabel="Unpublish"
        destructive
        isPending={unpublish.isPending}
        error={unpublish.error}
        errorMessages={CONFLICT_MESSAGES}
        onConfirm={() => run(() => unpublish.mutateAsync(itemId))}
      />
    </>
  );
};
