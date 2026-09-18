"use client";

import { useSearchParams } from "next/navigation";
import type { QueueParams } from "@/lib/api/editorial";
import { useReviewQueue } from "@/features/editorial/hooks";

const parsePage = (raw: string | null): number => {
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const useReviewQueuePage = () => {
  const searchParams = useSearchParams();
  const params: QueueParams = { page: parsePage(searchParams.get("page")) };
  return useReviewQueue(params);
};
