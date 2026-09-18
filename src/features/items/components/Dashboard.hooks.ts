"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ItemListParams } from "@/lib/api/items";
import type { ItemStatus } from "@/lib/api/content-types";
import { useAuth } from "@/features/auth/hooks";
import { useItems } from "@/features/items/hooks";

const ITEM_STATUSES: ItemStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "UNPUBLISHED",
  "ARCHIVED",
];

const parsePage = (raw: string | null): number => {
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

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

  const params: ItemListParams = {
    page: parsePage(searchParams.get("page")),
    ...(status ? { status } : {}),
    ...(isEditor && !showAll && user ? { authorId: user.id } : {}),
  };

  const itemsQuery = useItems(params);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    // Any change to the filters invalidates the offset — a `page` beyond
    // `totalPages` is a 422 from the API, not an empty list.
    next.delete("page");

    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return {
    ...itemsQuery,
    isEditor,
    showAll,
    status,
    setParam,
  };
};
