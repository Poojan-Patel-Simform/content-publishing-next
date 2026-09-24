"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ItemListParams } from "@/lib/api/items";
import { useAuthors } from "@/features/editorial/hooks";
import { useItems } from "@/features/items/hooks";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { parseStatus } from "@/features/items/components/Dashboard.hooks";

/**
 * Owns this page's URL-param-derived filters and the item list query. The
 * route itself is restricted to editors (`RoleGuard` in
 * `(app)/editorial/layout.tsx`), so there's no self-scoping here — omitting
 * `authorId` lists every author's items; setting it narrows to one.
 */
export const useAuthorsContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = parseStatus(searchParams.get("status"));
  const authorId = searchParams.get("authorId") || undefined;

  const params: ItemListParams = {
    page: parsePage(searchParams.get("page")),
    pageSize: parsePageSize(searchParams.get("pageSize")),
    ...(status === "REJECTED"
      ? { versionStatus: "REJECTED" as const }
      : status
        ? { status }
        : {}),
    ...(authorId ? { authorId } : {}),
  };

  const itemsQuery = useItems(params);
  const authorsQuery = useAuthors();

  const setParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    // Any change to the filters invalidates the offset — a `page` beyond
    // `totalPages` is a 422 from the API, not an empty list.
    next.delete("page");

    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const setParam = (key: string, value: string | null) => setParams({ [key]: value });

  return {
    ...itemsQuery,
    status,
    authorId,
    authors: authorsQuery.data?.authors ?? [],
    setParam,
  };
};
