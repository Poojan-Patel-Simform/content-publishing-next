"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  parsePage,
  parsePageSize,
} from "@/lib/pagination";
import type { PaginationMeta } from "@/lib/api/content-types";

/**
 * Writes `?page=` / `?pageSize=` back to the URL so a page of results is a
 * shareable link.
 *
 * The current page comes from the URL, not from `meta` — every list query uses
 * `keepPreviousData`, so while the next page is in flight `meta` still describes
 * the *previous* one. Deriving the Prev/Next targets from `meta.page` would make
 * a second click recompute the same target and push an identical URL.
 *
 * Callers must sit inside a `<Suspense>` boundary — `useSearchParams` opts the
 * subtree out of prerendering otherwise.
 */
interface PaginationProps {
  meta: PaginationMeta;
}

export const Pagination = ({ meta }: PaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parsePage(searchParams.get("page"));
  const pageSize = parsePageSize(searchParams.get("pageSize"));
  // `meta` lags the URL for the duration of the fetch; don't act on it until it
  // has caught up, or a rapid second click gets swallowed.
  const isSettled = meta.page === page;

  const goTo = (nextPage: number, nextPageSize = pageSize) => {
    const params = new URLSearchParams(searchParams.toString());
    // Page 1 and the API's own default page size are implicit; leaving them out
    // keeps the canonical URL clean.
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));

    if (nextPageSize === DEFAULT_PAGE_SIZE) params.delete("pageSize");
    else params.set("pageSize", String(nextPageSize));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  // Resizing the page invalidates the current offset — a `page` past the new
  // `totalPages` is a 422 from the API, not an empty list.
  const setPageSize = (value: string | null) => goTo(1, parsePageSize(value));

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-4 pt-2"
    >
      <div className="flex items-center gap-2">
        {/* Stays visible even on a single page — it's the control that makes
            more pages exist in the first place. */}
        <Select value={String(pageSize)} onValueChange={setPageSize}>
          <SelectTrigger size="sm" className="w-20" aria-label="Items per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">per page</span>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!meta.hasPrev || !isSettled}
            onClick={() => goTo(page - 1)}
          >
            <ChevronLeft />
            Previous
          </Button>

          <p className="text-sm text-muted-foreground tabular-nums">
            Page {page} of {meta.totalPages}
            <span className="hidden sm:inline">
              {" "}
              · {meta.totalItems} {meta.totalItems === 1 ? "item" : "items"}
            </span>
          </p>

          <Button
            variant="outline"
            size="sm"
            disabled={!meta.hasNext || !isSettled}
            onClick={() => goTo(page + 1)}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      )}
    </nav>
  );
};
