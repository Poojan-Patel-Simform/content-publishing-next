"use client";

import type {
  ContentVersionSummaryDto,
  ItemDetailDto,
} from "@/lib/api/content-types";
import { useEditorialActions } from "@/features/editorial/components/EditorialActions.hooks";
import { EditorialActionsPresentation } from "@/features/editorial/components/EditorialActions.presentation";

interface EditorialActionsProps {
  item: ItemDetailDto;
  latestVersion: ContentVersionSummaryDto | null;
  scheduledFor?: string | null;
}

/**
 * `scheduledFor` comes from the full `ContentVersionDto` — the summary the
 * detail page holds doesn't carry `scheduledPublishAt`.
 */
export const EditorialActions = ({
  item,
  latestVersion,
  scheduledFor,
}: EditorialActionsProps) => {
  const state = useEditorialActions(item, latestVersion);

  if (
    !state.isPendingReview &&
    !state.canPublish &&
    !state.isScheduled &&
    !state.canUnpublish
  ) {
    return null;
  }

  return (
    <EditorialActionsPresentation
      state={state}
      itemId={item.id}
      scheduledFor={scheduledFor}
    />
  );
};
