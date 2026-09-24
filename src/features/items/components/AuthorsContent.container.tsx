"use client";

import { Suspense } from "react";
import { useAuthorsContent } from "@/features/items/components/AuthorsContent.hooks";
import { DashboardListSkeleton } from "@/features/items/components/Dashboard.presentation";
import { AuthorsContentPresentation } from "@/features/items/components/AuthorsContent.presentation";

const AuthorsContentInner = () => {
  const { status, authorId, authors, setParam, data, isPending, isError, error, refetch } =
    useAuthorsContent();

  return (
    <AuthorsContentPresentation
      status={status}
      authorId={authorId}
      authors={authors}
      setParam={setParam}
      data={data}
      isPending={isPending}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
    />
  );
};

export const AuthorsContentContainer = () => {
  return (
    <Suspense fallback={<DashboardListSkeleton />}>
      <AuthorsContentInner />
    </Suspense>
  );
};
