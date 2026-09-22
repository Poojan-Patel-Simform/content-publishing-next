"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/api/api-error";
import type {
  ContentVersionSummaryDto,
  ItemDetailDto,
} from "@/lib/api/content-types";
import { SCHEDULE_MIN_LEAD_MS } from "@/lib/content-display";
import { toDateTimeLocalValue } from "@/lib/format";
import { contentKeys, editorialKeys, itemKeys } from "@/lib/query-keys";
import {
  useApproveVersion,
  useCancelSchedule,
  usePublishVersion,
  useRejectVersion,
  useScheduleVersion,
  useUnpublishItem,
} from "@/features/editorial/hooks";

export const COMMENT_MAX_LENGTH = 2000;

/**
 * A 409 here always means the same thing: the version moved on between the
 * page render and the click. Saying so — and refetching — beats the generic
 * "this item changed" copy, because the editor's next step is just to look
 * again at what the version became.
 */
export const CONFLICT_MESSAGES = {
  CONFLICT: "Someone else already acted on this — refreshing.",
};

export type OpenDialog =
  | "approve"
  | "reject"
  | "publish"
  | "schedule"
  | "cancelSchedule"
  | "unpublish"
  | null;

/**
 * Owns every piece of state and mutation wiring the editor action bar needs:
 * which dialog is open, the comment/reject/schedule field values, the six
 * mutations, and the conflict-refetch behaviour shared across all of them.
 */
export const useEditorialActions = (
  item: ItemDetailDto,
  latestVersion: ContentVersionSummaryDto | null
) => {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [comment, setComment] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  // Captured when the dialog opens rather than read during render: `Date.now()`
  // in a render body is impure, and a floor that drifts on every re-render
  // would fight the picker.
  const [scheduleFloor, setScheduleFloor] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const approve = useApproveVersion();
  const reject = useRejectVersion();
  const publish = usePublishVersion();
  const schedule = useScheduleVersion();
  const cancelSchedule = useCancelSchedule();
  const unpublish = useUnpublishItem();

  const status = latestVersion?.status;
  const isPendingReview = status === "PENDING_REVIEW";
  // The API also allows the direct publish/schedule of a `PENDING_REVIEW`
  // version (skipping the `APPROVED` stop), but this product doesn't: review
  // is the gate, so an editor approves first and only then publishes or
  // schedules. A version still in review offers Approve/Reject and nothing else.
  const canPublish = status === "APPROVED";
  const isScheduled = status === "SCHEDULED";
  const canUnpublish = item.status === "PUBLISHED";

  const close = () => {
    setDialog(null);
    setComment("");
    setRejectError(null);
    setScheduleError(null);
    approve.reset();
    reject.reset();
    publish.reset();
    schedule.reset();
    cancelSchedule.reset();
    unpublish.reset();
  };

  /** A 409 means the page is looking at a stale state — pull the fresh one. */
  const refetchOnConflict = (error: unknown) => {
    if (isApiError(error) && error.status === 409) {
      void queryClient.invalidateQueries({ queryKey: itemKeys.all });
      void queryClient.invalidateQueries({ queryKey: editorialKeys.all });
      void queryClient.invalidateQueries({ queryKey: contentKeys.all });
    }
  };

  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
      close();
    } catch (error) {
      // The message lands in the open dialog via its `error` prop.
      refetchOnConflict(error);
    }
  };

  const openSchedule = () => {
    // The picker's floor and the pre-submit guard share one lead, so the
    // picker can't offer a time the guard would then reject.
    const floor = toDateTimeLocalValue(
      new Date(Date.now() + SCHEDULE_MIN_LEAD_MS)
    );
    setScheduleFloor(floor);
    setScheduleAt(floor);
    setDialog("schedule");
  };

  const trimmedComment = comment.trim();
  const versionId = latestVersion?.id ?? "";

  const onConfirmReject = () => {
    // Required by the API; checked here so an empty box never costs a round
    // trip, and the author always gets a reason.
    if (!trimmedComment) {
      setRejectError("A comment is required — the author needs to know why.");
      return;
    }
    if (trimmedComment.length > COMMENT_MAX_LENGTH) {
      setRejectError(
        `Keep the comment to ${COMMENT_MAX_LENGTH} characters or fewer.`
      );
      return;
    }
    setRejectError(null);
    void run(() => reject.mutateAsync({ versionId, comment: trimmedComment }));
  };

  const onConfirmSchedule = () => {
    const when = new Date(scheduleAt);
    if (Number.isNaN(when.getTime())) {
      setScheduleError("Pick a date and time.");
      return;
    }
    if (when.getTime() < Date.now() + SCHEDULE_MIN_LEAD_MS) {
      // Not a hard failure server-side either — but a time already gone
      // would publish on the next tick, which is not what "schedule" means
      // to the person picking it.
      setScheduleError(
        "That time has passed (or is too close). A past time would publish on the next worker tick rather than when you chose — pick at least a minute out."
      );
      return;
    }
    setScheduleError(null);
    void run(() =>
      schedule.mutateAsync({
        versionId,
        // Full ISO 8601 with offset, as the API requires; `Z` is one.
        scheduledFor: when.toISOString(),
      })
    );
  };

  return {
    dialog,
    setDialog,
    close,
    comment,
    onCommentChange: setComment,
    rejectError,
    onRejectCommentChange: (value: string) => {
      setComment(value);
      if (rejectError) setRejectError(null);
    },
    scheduleAt,
    scheduleFloor,
    scheduleError,
    onScheduleAtChange: (value: string) => {
      setScheduleAt(value);
      if (scheduleError) setScheduleError(null);
    },
    openSchedule,
    trimmedComment,
    versionId,
    isPendingReview,
    canPublish,
    isScheduled,
    canUnpublish,
    approve,
    reject,
    publish,
    schedule,
    cancelSchedule,
    unpublish,
    run,
    onConfirmReject,
    onConfirmSchedule,
  };
};
