"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ItemListParams } from "@/lib/api/items";
import type { ItemStatus } from "@/lib/api/content-types";
import { useAuth } from "@/features/auth/hooks";
import { useItems } from "@/features/items/hooks";
import { parsePage, parsePageSize } from "@/lib/pagination";

const ITEM_STATUSES: ItemStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "UNPUBLISHED",
  "ARCHIVED",
];

const parseStatus = (raw: string | null): ItemStatus | undefined => {
  return ITEM_STATUSES.find((status) => status === raw);
};

/**
 * Owns the dashboard's URL-param-derived filters and the item list query that
 * depends on them. `AuthGuard` in the (app) layout only renders children once
 * `/me` has resolved, so `user` is already populated here.
 */
export const useDashboard = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const isEditor = user?.role === "EDITOR";
  // Authors are already self-scoped server-side, so the toggle is only ever
  // meaningful — and only ever rendered — for an editor.
  const showAll = isEditor && searchParams.get("scope") === "all";
  const status = parseStatus(searchParams.get("status"));
  // Drilling into one author only makes sense on top of the all-authors view —
  // an author's own filter is already implied by their self-scope.
  const authorId =
    isEditor && showAll ? searchParams.get("authorId") || undefined : undefined;

  const params: ItemListParams = {
    page: parsePage(searchParams.get("page")),
    pageSize: parsePageSize(searchParams.get("pageSize")),
    ...(status ? { status } : {}),
    ...(isEditor && !showAll && user ? { authorId: user.id } : {}),
    ...(authorId ? { authorId } : {}),
  };

  const itemsQuery = useItems(params);

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

  const toggleScope = () =>
    // Leaving the all-authors view drops the author filter too — it has no
    // meaning once the list is self-scoped again.
    setParams({ scope: showAll ? null : "all", authorId: null });

  return {
    ...itemsQuery,
    isEditor,
    showAll,
    status,
    authorId,
    setParam,
    toggleScope,
  };
};
