import Link from "next/link";
import type { ContentVersionSummaryDto } from "@/lib/api/content-types";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/features/items/components/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

interface VersionTimelineProps {
  itemId: string;
  versions: ContentVersionSummaryDto[];
  publishedVersionId: string | null;
}

/** Version history, newest first (the order the API returns). */
export const VersionTimeline = ({
  itemId,
  versions,
  publishedVersionId,
}: VersionTimelineProps) => {
  if (versions.length === 0) {
    return <EmptyState title="No versions yet." />;
  }

  return (
    <ol className="space-y-2">
      {versions.map((version) => (
        <li
          key={version.id}
          className="relative rounded-lg p-3 ring-1 ring-foreground/10 transition-colors hover:bg-accent/40"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link
              href={`/items/${itemId}/versions/${version.id}`}
              className="font-medium after:absolute after:inset-0 hover:underline"
            >
              v{version.versionNumber} · {version.title}
            </Link>
            <StatusBadge status={version.status} />
            {version.id === publishedVersionId && (
              <span className="text-xs text-muted-foreground">live</span>
            )}
            <time
              dateTime={version.createdAt}
              className="ml-auto text-xs text-muted-foreground"
            >
              {formatDateTime(version.createdAt)}
            </time>
          </div>
          {version.changeSummary && (
            <p className="pt-1 text-sm text-muted-foreground">
              {version.changeSummary}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
};
