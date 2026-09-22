"use client";

import { useSearchParams } from "next/navigation";
import type { QueueParams } from "@/lib/api/editorial";
import { useReviewQueue } from "@/features/editorial/hooks";
import { parsePage, parsePageSize } from "@/lib/pagination";

export const useReviewQueuePage = () => {
  const searchParams = useSearchParams();
  const params: QueueParams = {
    page: parsePage(searchParams.get("page")),
    pageSize: parsePageSize(searchParams.get("pageSize")),
  };
  return useReviewQueue(params);
};
