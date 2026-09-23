import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { isApiError } from "@/lib/api/api-error";
import type { Paginated } from "@/lib/api/content-types";
import type { ContentItemDto } from "@/lib/api/content-types";
import type { DashboardFilter } from "@/features/items/components/Dashboard.hooks";
import { itemDisplayTitle } from "@/lib/content-display";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/features/items/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PUBLISHED", label: "Published" },
  { value: "UNPUBLISHED", label: "Unpublished" },
  { value: "ARCHIVED", label: "Archived" },
];

interface ItemRowProps {
  item: ContentItemDto;
  showAuthor: boolean;
}

const ItemRow = ({ item, showAuthor }: ItemRowProps) => {
  return (
    <Card size="sm" className="relative transition-colors hover:bg-accent/40">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-(--card-spacing)">
        <Link
          href={`/items/${item.id}`}
          className="font-medium after:absolute after:inset-0 hover:underline"
        >
          {itemDisplayTitle(item)}
        </Link>
        <StatusBadge status={item.status} />
        {/* The list endpoint only carries the raw authorId — no joined name —
         * so this is what an editor has to filter by author on. */}
        {showAuthor && (
          <span className="font-mono text-xs text-muted-foreground">
            {item.authorId.slice(0, 8)}
          </span>
        )}
        <time
          dateTime={item.updatedAt}
          className="ml-auto text-xs text-muted-foreground"
        >
          Updated {formatDateTime(item.updatedAt)}
        </time>
      </div>
    </Card>
  );
};

interface DashboardListErrorProps {
  error: unknown;
  onRetry: () => void;
}

/** The API answers a `page` past `totalPages` with a 422, so a stale deep link
 * needs a way back rather than a raw error. */
const DashboardListError = ({ error, onRetry }: DashboardListErrorProps) => {
  if (isApiError(error) && error.code === "VALIDATION_ERROR") {
    return (
      <EmptyState
        title="That page doesn't exist"
        description="This list has fewer pages than the link asked for."
        action={
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            Back to the first page
          </Button>
        }
      />
    );
  }

  return (
    <ErrorState error={error} onRetry={onRetry} title="Couldn't load your content" />
  );
};

export const DashboardListSkeleton = () => {
  return (
    <ul className="space-y-2" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="flex items-center gap-3 rounded-xl p-4 ring-1 ring-foreground/10">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="ml-auto h-4 w-32" />
        </li>
      ))}
    </ul>
  );
};

export interface DashboardPresentationProps {
  isEditor: boolean;
  showAll: boolean;
  status: DashboardFilter | undefined;
  authorId: string | undefined;
  setParam: (key: string, value: string | null) => void;
  toggleScope: () => void;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  data: Paginated<ContentItemDto> | undefined;
  onRetry: () => void;
}

export const DashboardPresentation = ({
  isEditor,
  showAll,
  status,
  authorId,
  setParam,
  toggleScope,
  isPending,
  isError,
  error,
  data,
  onRetry,
}: DashboardPresentationProps) => {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            My content
          </h1>
          <p className="text-sm text-muted-foreground">
            {showAll
              ? "Every item in the workspace."
              : "Everything you've written, newest activity first."}
          </p>
        </div>

        <Button render={<Link href="/items/new" />}>
          <Plus />
          New draft
        </Button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={status ?? "all"}
          onValueChange={(value) =>
            setParam("status", value === "all" ? null : String(value))
          }
        >
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isEditor && (
          <Button variant="outline" size="sm" onClick={toggleScope}>
            {showAll ? "Show only mine" : "Show all authors"}
          </Button>
        )}
      </div>

      {isEditor && showAll && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setParam("authorId", String(data.get("authorId") ?? "").trim());
          }}
          // Re-mount when the URL changes so the uncontrolled input picks up
          // the new default (back button, a shared link).
          key={authorId}
          className="flex flex-wrap items-end gap-2"
        >
          <div className="min-w-56 space-y-1.5">
            <Label htmlFor="dashboard-author-id">Author ID</Label>
            <Input
              id="dashboard-author-id"
              name="authorId"
              defaultValue={authorId ?? ""}
              placeholder="Paste an author's id to filter"
              className="font-mono text-sm"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">
            <Search />
            Filter
          </Button>
          {authorId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setParam("authorId", null)}
            >
              <X />
              Clear
            </Button>
          )}
        </form>
      )}

      {isPending ? (
        <DashboardListSkeleton />
      ) : isError ? (
        <DashboardListError error={error} onRetry={onRetry} />
      ) : data!.items.length === 0 ? (
        <EmptyState
          title={
            status
              ? `Nothing ${STATUS_TABS.find((tab) => tab.value === status)?.label.toLowerCase()} here.`
              : "No drafts yet — write your first one."
          }
          description={
            status ? "Try another tab to see the rest." : undefined
          }
          action={
            <Button size="sm" render={<Link href="/items/new" />}>
              <Plus />
              New draft
            </Button>
          }
        />
      ) : (
        <>
          <ul className="space-y-2">
            {data!.items.map((item) => (
              <li key={item.id}>
                <ItemRow item={item} showAuthor={isEditor && showAll} />
              </li>
            ))}
          </ul>
          <Pagination meta={data!.meta} />
        </>
      )}
    </div>
  );
};
