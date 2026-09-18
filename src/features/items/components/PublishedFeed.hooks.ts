"use client";

import { useSearchParams } from "next/navigation";
import type { ContentListParams } from "@/lib/api/content";
import { usePublishedList } from "@/features/items/hooks";

const parsePage = (raw: string | null): number => {
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const usePublishedFeed = () => {
  const searchParams = useSearchParams();

  const params: ContentListParams = {
    page: parsePage(searchParams.get("page")),
    ...(searchParams.get("q") ? { q: searchParams.get("q")! } : {}),
    ...(searchParams.get("categorySlug")
      ? { categorySlug: searchParams.get("categorySlug")! }
      : {}),
    ...(searchParams.get("tagSlug") ? { tagSlug: searchParams.get("tagSlug")! } : {}),
    ...(searchParams.get("sort") === "oldest" ? { sort: "oldest" as const } : {}),
  };

  const query = usePublishedList(params);
  const hasFilters = Boolean(params.q || params.categorySlug || params.tagSlug);

  return { ...query, hasFilters };
};
