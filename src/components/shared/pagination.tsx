"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/api/content-types";

/**
 * Writes `?page=` back to the URL so a page of results is a shareable link.
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

  if (meta.totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    // Page 1 is the default; leaving it out keeps the canonical URL clean.
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 pt-2"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={!meta.hasPrev}
        onClick={() => goTo(meta.page - 1)}
      >
        <ChevronLeft />
        Previous
      </Button>

      <p className="text-sm text-muted-foreground tabular-nums">
        Page {meta.page} of {meta.totalPages}
        <span className="hidden sm:inline">
          {" "}
          · {meta.totalItems} {meta.totalItems === 1 ? "item" : "items"}
        </span>
      </p>

      <Button
        variant="outline"
        size="sm"
        disabled={!meta.hasNext}
        onClick={() => goTo(meta.page + 1)}
      >
        Next
        <ChevronRight />
      </Button>
    </nav>
  );
};
