"use client";

import { Suspense } from "react";
import { useDashboard } from "@/features/items/components/Dashboard.hooks";
import {
  DashboardListSkeleton,
  DashboardPresentation,
} from "@/features/items/components/Dashboard.presentation";

const DashboardInner = () => {
  const { isEditor, showAll, status, setParam, data, isPending, isError, error, refetch } =
    useDashboard();

  return (
    <DashboardPresentation
      isEditor={isEditor}
      showAll={showAll}
      status={status}
      setParam={setParam}
      data={data}
      isPending={isPending}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
    />
  );
};

export const DashboardContainer = () => {
  return (
    <Suspense fallback={<DashboardListSkeleton />}>
      <DashboardInner />
    </Suspense>
  );
};
