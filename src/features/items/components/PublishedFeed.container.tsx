"use client";

import { Suspense } from "react";
import { usePublishedFeed } from "@/features/items/components/PublishedFeed.hooks";
import {
  PublishedFeedPresentation,
  PublishedFeedSkeleton,
} from "@/features/items/components/PublishedFeed.presentation";

const PublishedFeedInner = () => {
  const { data, isPending, isError, error, refetch, hasFilters } = usePublishedFeed();

  return (
    <PublishedFeedPresentation
      data={data}
      isPending={isPending}
      isError={isError}
      error={error}
      hasFilters={hasFilters}
      onRetry={() => refetch()}
    />
  );
};

export const PublishedFeedContainer = () => {
  return (
    <Suspense fallback={<PublishedFeedSkeleton />}>
      <PublishedFeedInner />
    </Suspense>
  );
};
