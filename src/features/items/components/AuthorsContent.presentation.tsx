import Link from "next/link";
import { isApiError } from "@/lib/api/api-error";
import type { AuthorSummary, Paginated } from "@/lib/api/content-types";
import type { ContentItemDto } from "@/lib/api/content-types";
import type { DashboardFilter } from "@/features/items/components/Dashboard.hooks";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination } from "@/components/shared/pagination";
import { ItemRow } from "@/features/items/components/item-row";
import { DashboardListSkeleton } from "@/features/items/components/Dashboard.presentation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALL_AUTHORS = "__all__";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PUBLISHED", label: "Published" },
  { value: "UNPUBLISHED", label: "Unpublished" },
  { value: "ARCHIVED", label: "Archived" },
];

interface AuthorsContentListErrorProps {
  error: unknown;
  onRetry: () => void;
}

/** The API answers a `page` past `totalPages` with a 422, so a stale deep link
 * needs a way back rather than a raw error. */
const AuthorsContentListError = ({ error, onRetry }: AuthorsContentListErrorProps) => {
  if (isApiError(error) && error.code === "VALIDATION_ERROR") {
    return (
      <EmptyState
        title="That page doesn't exist"
        description="This list has fewer pages than the link asked for."
        action={
          <Button variant="outline" size="sm" render={<Link href="/editorial/authors" />}>
            Back to the first page
          </Button>
        }
      />
    );
  }

  return (
    <ErrorState error={error} onRetry={onRetry} title="Couldn't load this content" />
  );
};

export interface AuthorsContentPresentationProps {
  status: DashboardFilter | undefined;
  authorId: string | undefined;
  authors: AuthorSummary[];
  setParam: (key: string, value: string | null) => void;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  data: Paginated<ContentItemDto> | undefined;
  onRetry: () => void;
}

export const AuthorsContentPresentation = ({
  status,
  authorId,
  authors,
  setParam,
  isPending,
  isError,
  error,
  data,
  onRetry,
}: AuthorsContentPresentationProps) => {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Authors&apos; content
        </h1>
        <p className="text-sm text-muted-foreground">
          Every item in the workspace, across all authors.
        </p>
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
      </div>

      <div className="min-w-56 space-y-1.5">
        <Label htmlFor="authors-content-author">Author</Label>
        <Select
          value={authorId ?? ALL_AUTHORS}
          onValueChange={(value) =>
            setParam("authorId", value === ALL_AUTHORS ? null : value)
          }
        >
          <SelectTrigger id="authors-content-author" className="w-full sm:w-64">
            <SelectValue placeholder="All authors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_AUTHORS}>All authors</SelectItem>
            {authors.map((author) => (
              <SelectItem key={author.id} value={author.id}>
                {author.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <DashboardListSkeleton />
      ) : isError ? (
        <AuthorsContentListError error={error} onRetry={onRetry} />
      ) : data!.items.length === 0 ? (
        <EmptyState
          title={status ? "Nothing here." : "No content yet."}
          description={status ? "Try another tab to see the rest." : undefined}
        />
      ) : (
        <>
          <ul className="space-y-2">
            {data!.items.map((item) => (
              <li key={item.id}>
                <ItemRow item={item} showAuthor />
              </li>
            ))}
          </ul>
          <Pagination meta={data!.meta} />
        </>
      )}
    </div>
  );
};
