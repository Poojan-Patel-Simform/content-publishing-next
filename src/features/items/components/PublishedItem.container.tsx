"use client";

import { isApiError } from "@/lib/api/api-error";
import { usePublishedItem } from "@/features/items/hooks";
import {
  PublishedItemNotFound,
  PublishedItemPresentation,
  PublishedItemSkeleton,
} from "@/features/items/components/PublishedItem.presentation";
import { ErrorState } from "@/components/shared/error-state";

interface PublishedItemContainerProps {
  slug: string;
}

export const PublishedItemContainer = ({ slug }: PublishedItemContainerProps) => {
  const { data, isPending, isError, error, refetch } = usePublishedItem(slug);

  if (isPending) return <PublishedItemSkeleton />;

  // `docs/api.md` visibility contract: a slug that doesn't exist and a slug
  // whose item isn't PUBLISHED both answer 404, and must look identical here —
  // rendering anything else would confirm that a draft exists.
  if (isError) {
    if (isApiError(error) && error.code === "NOT_FOUND") return <PublishedItemNotFound />;
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Couldn't load this page"
      />
    );
  }

  return <PublishedItemPresentation item={data.item} />;
};
