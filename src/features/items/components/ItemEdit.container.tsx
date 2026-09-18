"use client";

import { isApiError } from "@/lib/api/api-error";
import { isEditableVersion } from "@/lib/content-display";
import { useItemEdit } from "@/features/items/components/ItemEdit.hooks";
import {
  ItemEditNothingToEdit,
  ItemEditNotYours,
  ItemEditPresentation,
  ItemEditSkeleton,
} from "@/features/items/components/ItemEdit.presentation";
import { ErrorState } from "@/components/shared/error-state";

interface ItemEditContainerProps {
  id: string;
}

export const ItemEditContainer = ({ id }: ItemEditContainerProps) => {
  const { itemQuery, versionId, versionQuery, onSubmit } = useItemEdit(id);

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
  const summary = item.currentDraft;

  if (!summary || !isEditableVersion(summary.status)) {
    return (
      <ItemEditNothingToEdit
        id={id}
        description={
          summary
            ? `Version ${summary.versionNumber} is ${summary.status.toLowerCase().replace(/_/g, " ")}, and only a draft or a rejected version can be edited.`
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
