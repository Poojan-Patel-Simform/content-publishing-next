"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isApiError } from "@/lib/api/api-error";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/features/auth/hooks";
import { useItemVersion } from "@/features/items/hooks";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/features/items/components/status-badge";
import { RestoreVersionButton } from "@/features/items/components/restore-version-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const VersionDetailPage = ({
  params,
}: PageProps<"/items/[id]/versions/[versionId]">) => {
  const { id, versionId } = use(params);
  const { user } = useAuth();
  const { data, isPending, isError, error, refetch } = useItemVersion(
    id,
    versionId,
  );

  if (isPending) return <VersionSkeleton />;

  if (isError) {
    if (isApiError(error) && error.status === 404) {
      return (
        <EmptyState
          title="Version not found, or not yours"
          description="It may belong to another author's item."
          action={
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/items/${id}`} />}
            >
              Back to the item
            </Button>
          }
        />
      );
    }
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Couldn't load this version"
      />
    );
  }

  const { version } = data;

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          render={<Link href={`/items/${id}`} />}
        >
          <ArrowLeft />
          Back to the item
        </Button>

        <RestoreVersionButton itemId={id} version={version} />
      </div>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            {version.title}
          </h1>
          <StatusBadge status={version.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Version {version.versionNumber} · created{" "}
          <time dateTime={version.createdAt}>
            {formatDateTime(version.createdAt)}
          </time>
        </p>
        {version.changeSummary && (
          <p className="text-sm text-muted-foreground">
            Change summary: {version.changeSummary}
          </p>
        )}
      </header>

      {version.excerpt && (
        <p className="max-w-prose text-base text-muted-foreground">
          {version.excerpt}
        </p>
      )}

      {/* Bodies are stored and served as plain text — rendered as text, same as
          the public article page, so there is no HTML injection surface. */}
      <div className="max-w-prose space-y-4 text-base leading-7">
        {version.body
          .split(/\n{2,}/)
          .filter((part) => part.trim().length > 0)
          .map((paragraph, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
      </div>
    </article>
  );
};

const VersionSkeleton = () => {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-48" />
      <div className="max-w-prose space-y-3">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-4 w-full last:w-1/2" />
        ))}
      </div>
    </div>
  );
};

export default VersionDetailPage;
