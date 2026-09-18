"use client";

import Link from "next/link";
import { isApiError } from "@/lib/api/api-error";
import { useItemDetail } from "@/features/items/components/ItemDetail.hooks";
import {
  ItemDetailPresentation,
  ItemDetailSkeleton,
} from "@/features/items/components/ItemDetail.presentation";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

interface ItemDetailContainerProps {
  id: string;
}

export const ItemDetailContainer = ({ id }: ItemDetailContainerProps) => {
  const { itemQuery, versionsQuery, auditQuery, item, latestVersion, isOwnItem, isEditor, rejected, scheduledFor } =
    useItemDetail(id);

  if (itemQuery.isPending) return <ItemDetailSkeleton />;

  if (itemQuery.isError) {
    // The API answers 404 for both "no such item" and "someone else's item", by
    // design (api.md ownership contract) — so does this page.
    if (isApiError(itemQuery.error) && itemQuery.error.status === 404) {
      return (
        <EmptyState
          title="Item not found, or not yours"
          description="It may have been archived, or it belongs to another author."
          action={
            <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
              Back to my content
            </Button>
          }
        />
      );
    }
    return (
      <ErrorState
        error={itemQuery.error}
        onRetry={() => itemQuery.refetch()}
        title="Couldn't load this item"
      />
    );
  }

  if (!item) return <ItemDetailSkeleton />;

  return (
    <ItemDetailPresentation
      item={item}
      latestVersion={latestVersion}
      isOwnItem={isOwnItem}
      isEditor={isEditor}
      rejected={rejected}
      scheduledFor={scheduledFor}
      versionsSection={{
        isPending: versionsQuery.isPending,
        isError: versionsQuery.isError,
        error: versionsQuery.error,
        versions: versionsQuery.data?.versions ?? [],
        onRetry: () => versionsQuery.refetch(),
      }}
      auditSection={{
        isPending: auditQuery.isPending,
        isError: auditQuery.isError,
        error: auditQuery.error,
        events: auditQuery.data?.events ?? [],
        onRetry: () => auditQuery.refetch(),
      }}
    />
  );
};
