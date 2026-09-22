"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api/categories";
import { categoryKeys } from "@/lib/query-keys";

/** The fixed backend category list — rarely changes, so cache it generously. */
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoriesApi.list(),
    staleTime: 5 * 60 * 1000,
  });
};
