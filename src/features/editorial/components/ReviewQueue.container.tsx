"use client";

import { Suspense } from "react";
import { useReviewQueuePage } from "@/features/editorial/components/ReviewQueue.hooks";
import {
  ReviewQueuePresentation,
  ReviewQueueSkeleton,
} from "@/features/editorial/components/ReviewQueue.presentation";

const ReviewQueueInner = () => {
  const { data, isPending, isError, error, refetch } = useReviewQueuePage();

  return (
    <ReviewQueuePresentation
      data={data}
      isPending={isPending}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
    />
  );
};

export const ReviewQueueContainer = () => {
  return (
    <Suspense fallback={<ReviewQueueSkeleton />}>
      <ReviewQueueInner />
    </Suspense>
  );
};
