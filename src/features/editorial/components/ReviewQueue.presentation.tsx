import Link from "next/link";
import { isApiError } from "@/lib/api/api-error";
import type { Paginated, ReviewQueueEntry } from "@/lib/api/content-types";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/features/items/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface QueueRowProps {
  entry: ReviewQueueEntry;
}

const QueueRow = ({ entry }: QueueRowProps) => {
  // A queued version is by definition `PENDING_REVIEW`, so `submittedAt` is
  // set — but the type allows null, and a missing timestamp shouldn't blank
  // out the whole row.
  const submitted = entry.submittedAt;

  return (
    <Card size="sm" className="relative transition-colors hover:bg-accent/40">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-(--card-spacing)">
        <Link
          href={`/items/${entry.contentItemId}`}
          className="font-medium after:absolute after:inset-0 hover:underline"
        >
          {entry.title}
        </Link>
        <StatusBadge status={entry.status} />
        <span className="text-xs text-muted-foreground">
          v{entry.versionNumber} · {entry.author.displayName}
        </span>
        {submitted && (
          <time
            dateTime={submitted}
            title={formatDateTime(submitted)}
            className="ml-auto text-xs text-muted-foreground"
          >
            Submitted {formatRelativeTime(submitted)}
          </time>
        )}
      </div>
      {entry.changeSummary && (
        <p className="mt-1 line-clamp-2 px-(--card-spacing) text-sm text-muted-foreground">
          {entry.changeSummary}
        </p>
      )}
    </Card>
  );
};

interface QueueErrorProps {
  error: unknown;
  onRetry: () => void;
}

/** A `page` past `totalPages` is a 422 from the API, not an empty list — a
 * stale deep link needs a way back rather than a raw error. */
const QueueError = ({ error, onRetry }: QueueErrorProps) => {
  if (isApiError(error) && error.code === "VALIDATION_ERROR") {
    return (
      <EmptyState
        title="That page doesn't exist"
        description="The queue has fewer pages than the link asked for."
        action={
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/editorial/queue" />}
          >
            Back to the first page
          </Button>
        }
      />
    );
  }

  return (
    <ErrorState error={error} onRetry={onRetry} title="Couldn't load the queue" />
  );
};

export const ReviewQueueSkeleton = () => {
  return (
    <ul className="space-y-2" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 rounded-xl p-4 ring-1 ring-foreground/10"
        >
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="ml-auto h-4 w-32" />
        </li>
      ))}
    </ul>
  );
};

export interface ReviewQueuePresentationProps {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  data: Paginated<ReviewQueueEntry> | undefined;
  onRetry: () => void;
}

export const ReviewQueuePresentation = ({
  isPending,
  isError,
  error,
  data,
  onRetry,
}: ReviewQueuePresentationProps) => {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Review queue
        </h1>
        <p className="text-sm text-muted-foreground">
          Versions waiting for a decision, the longest-waiting first.
        </p>
      </header>

      {isPending ? (
        <ReviewQueueSkeleton />
      ) : isError ? (
        <QueueError error={error} onRetry={onRetry} />
      ) : data!.items.length === 0 ? (
        <EmptyState
          title="Nothing waiting for review."
          description="Submitted versions land here the moment an author sends them over."
        />
      ) : (
        <>
          <ul className="space-y-2">
            {data!.items.map((entry) => (
              <li key={entry.id}>
                <QueueRow entry={entry} />
              </li>
            ))}
          </ul>
          <Pagination meta={data!.meta} />
        </>
      )}
    </div>
  );
};
