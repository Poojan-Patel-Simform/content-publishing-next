"use client";

import { isApiError } from "@/lib/api/api-error";
import { isEditableVersion } from "@/lib/content-display";
import { useItemEdit } from "@/features/items/components/ItemEdit.hooks";
import {
  ItemEditNothingToEdit,
  ItemEditNotYourItem,
  ItemEditNotYours,
  ItemEditPresentation,
  ItemEditSkeleton,
} from "@/features/items/components/ItemEdit.presentation";
import { ErrorState } from "@/components/shared/error-state";

interface ItemEditContainerProps {
  id: string;
}

export const ItemEditContainer = ({ id }: ItemEditContainerProps) => {
  const { itemQuery, versionId, versionQuery, isOwnItem, onSubmit } =
    useItemEdit(id);

  if (itemQuery.isPending || (versionId && versionQuery.isPending)) {
    return <ItemEditSkeleton />;
  }

  if (itemQuery.isError) {
    if (isApiError(itemQuery.error) && itemQuery.error.status === 404) {
      return <ItemEditNotYours />;
    }
    return (
      <ErrorState
        error={itemQuery.error}
        onRetry={() => itemQuery.refetch()}
        title="Couldn't load this item"
      />
    );
  }

  const { item } = itemQuery.data;

  // An author can only ever reach their own items (the API 404s above), so
  // this is the editor-typed-the-URL case.
  if (!isOwnItem) return <ItemEditNotYourItem id={id} />;

  const summary = item.currentDraft;

  if (!summary || !isEditableVersion(summary.status)) {
    return (
      <ItemEditNothingToEdit
        id={id}
        description={
          summary
            ? `Version ${summary.versionNumber} is ${summary.status.toLowerCase().replace(/_/g, " ")}, and only a draft or a rejected version can be edited.${summary.status === "UNPUBLISHED" ? " Start a revision from the item page to edit it." : ""}`
            : "This item has no version yet."
        }
      />
    );
  }

  if (versionQuery.isError) {
    return (
      <ErrorState
        error={versionQuery.error}
        onRetry={() => versionQuery.refetch()}
        title="Couldn't load this version"
      />
    );
  }

  const version = versionQuery.data?.version;
  if (!version) return <ItemEditSkeleton />;

  return (
    <ItemEditPresentation id={id} item={item} version={version} onSubmit={onSubmit} />
  );
};
