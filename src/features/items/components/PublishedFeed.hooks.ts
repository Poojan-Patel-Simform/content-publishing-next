"use client";

import { useSearchParams } from "next/navigation";
import type { ContentListParams } from "@/lib/api/content";
import { usePublishedList } from "@/features/items/hooks";
import { parsePage, parsePageSize } from "@/lib/pagination";

export const usePublishedFeed = () => {
  const searchParams = useSearchParams();

  const params: ContentListParams = {
    page: parsePage(searchParams.get("page")),
    pageSize: parsePageSize(searchParams.get("pageSize")),
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
