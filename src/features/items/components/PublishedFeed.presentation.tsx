import Link from "next/link";
import { isApiError } from "@/lib/api/api-error";
import type { Paginated, PublicItemSummary } from "@/lib/api/content-types";
import { formatDate } from "@/lib/format";
import { ContentFilters } from "@/features/items/components/content-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedCardProps {
  item: PublicItemSummary;
}

const FeedCard = ({ item }: FeedCardProps) => {
  return (
    <Card className="relative transition-colors hover:bg-accent/40">
      <CardHeader>
        <CardTitle>
          {/* The whole card is the hit area; the link stretches to cover it. */}
          <Link
            href={`/content/${item.slug}`}
            className="after:absolute after:inset-0 hover:underline"
          >
            {item.title}
          </Link>
        </CardTitle>
        <CardDescription>
          <time dateTime={item.publishedAt}>
            {formatDate(item.publishedAt)}
          </time>
          {item.excerpt && <span className="block pt-1.5">{item.excerpt}</span>}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

interface FeedErrorProps {
  error: unknown;
  onRetry: () => void;
}

/**
 * The API rejects a `page` beyond `totalPages` with a 422 rather than returning
 * an empty array, so a stale deep link needs a way back rather than a raw error.
 */
const FeedError = ({ error, onRetry }: FeedErrorProps) => {
  const outOfRange = isApiError(error) && error.code === "VALIDATION_ERROR";

  if (outOfRange) {
    return (
      <EmptyState
        title="That page doesn't exist"
        description="This list has fewer pages than the link asked for."
        action={
          <Button variant="outline" size="sm" render={<Link href="/" />}>
            Back to the first page
          </Button>
        }
      />
    );
  }

  return (
    <ErrorState
      error={error}
      onRetry={onRetry}
      title="Couldn't load the feed"
    />
  );
};

export const PublishedFeedSkeleton = () => {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <li
          key={index}
          className="space-y-2 rounded-xl p-4 ring-1 ring-foreground/10"
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-24" />
        </li>
      ))}
    </ul>
  );
};

export interface PublishedFeedPresentationProps {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  data: Paginated<PublicItemSummary> | undefined;
  hasFilters: boolean;
  onRetry: () => void;
}

export const PublishedFeedPresentation = ({
  isPending,
  isError,
  error,
  data,
  hasFilters,
  onRetry,
}: PublishedFeedPresentationProps) => {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Published content
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything that has gone live, newest first.
        </p>
      </header>

      <ContentFilters />

      {isPending ? (
        <PublishedFeedSkeleton />
      ) : isError ? (
        <FeedError error={error} onRetry={onRetry} />
      ) : data!.items.length === 0 ? (
        <EmptyState
          title={
            hasFilters
              ? "Nothing matches those filters."
              : "No published content yet."
          }
          description={
            hasFilters
              ? "Try a broader search, or clear the filters to see everything."
              : undefined
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {data!.items.map((item) => (
              <li key={item.id}>
                <FeedCard item={item} />
              </li>
            ))}
          </ul>
          <Pagination meta={data!.meta} />
        </>
      )}
    </div>
  );
};
