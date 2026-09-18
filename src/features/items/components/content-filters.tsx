"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContentListParams } from "@/lib/api/content";

const SORT_LABELS: Record<NonNullable<ContentListParams["sort"]>, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
};

/** The filter params this form owns — everything except `page`. */
const FILTER_KEYS = ["q", "categorySlug", "tagSlug", "sort"] as const;

/**
 * Every filter lives in the URL, so a filtered feed is a shareable link and the
 * back button walks the refinements.
 *
 * There is no taxonomy endpoint in the API (see `docs/api.md`), so category and
 * tag are entered as slugs rather than picked from a list.
 *
 * Callers must sit inside a `<Suspense>` boundary — `useSearchParams` opts the
 * subtree out of prerendering otherwise.
 */
export const ContentFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const categorySlug = searchParams.get("categorySlug") ?? "";
  const tagSlug = searchParams.get("tagSlug") ?? "";
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const hasFilters = FILTER_KEYS.some((key) => searchParams.get(key));

  const apply = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    // Any change to the filters invalidates the current offset — a `page` past
    // the new `totalPages` is a 422 from the API, not an empty list.
    params.delete("page");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    apply({
      q: String(data.get("q") ?? "").trim(),
      categorySlug: String(data.get("categorySlug") ?? "").trim(),
      tagSlug: String(data.get("tagSlug") ?? "").trim(),
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      // Re-mount when the URL changes so the uncontrolled inputs pick up the
      // new defaults (back button, "Clear filters", a shared link).
      key={`${q}|${categorySlug}|${tagSlug}`}
      className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex-1 space-y-1.5 sm:min-w-56">
        <Label htmlFor="feed-q">Search</Label>
        <Input
          id="feed-q"
          name="q"
          type="search"
          defaultValue={q}
          maxLength={200}
          placeholder="Title starts with..."
        />
      </div>

      <div className="space-y-1.5 sm:w-40">
        <Label htmlFor="feed-category">Category</Label>
        <Input
          id="feed-category"
          name="categorySlug"
          defaultValue={categorySlug}
          maxLength={200}
          placeholder="slug"
        />
      </div>

      <div className="space-y-1.5 sm:w-40">
        <Label htmlFor="feed-tag">Tag</Label>
        <Input
          id="feed-tag"
          name="tagSlug"
          defaultValue={tagSlug}
          maxLength={200}
          placeholder="slug"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Sort</Label>
        <Select
          value={sort}
          onValueChange={(value) => apply({ sort: value === "oldest" ? "oldest" : "" })}
        >
          <SelectTrigger className="w-full sm:w-40" aria-label="Sort order">
            <SelectValue>{(value: string) => SORT_LABELS[value as "newest"]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{SORT_LABELS.newest}</SelectItem>
            <SelectItem value="oldest">{SORT_LABELS.oldest}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm">
          <Search />
          Search
        </Button>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
          >
            <X />
            Clear
          </Button>
        )}
      </div>
    </form>
  );
};
