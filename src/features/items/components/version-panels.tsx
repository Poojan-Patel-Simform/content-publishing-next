import Link from "next/link";
import type {
  ContentVersionSummaryDto,
  ItemDetailDto,
} from "@/lib/api/content-types";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/features/items/components/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VersionSummaryProps {
  itemId: string;
  version: ContentVersionSummaryDto;
}

const VersionSummary = ({ itemId, version }: VersionSummaryProps) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/items/${itemId}/versions/${version.id}`}
          className="font-medium hover:underline"
        >
          v{version.versionNumber} · {version.title}
        </Link>
        <StatusBadge status={version.status} />
      </div>
      {version.changeSummary && (
        <p className="text-sm text-muted-foreground">{version.changeSummary}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {version.publishedAt
          ? `Published ${formatDateTime(version.publishedAt)}`
          : version.submittedAt
            ? `Submitted ${formatDateTime(version.submittedAt)}`
            : `Created ${formatDateTime(version.createdAt)}`}
      </p>
    </div>
  );
};

export interface VersionPanelsProps {
  item: ItemDetailDto;
  latestVersion: ContentVersionSummaryDto | null;
}

/**
 * The two panels are the whole point of the detail page: they show, side by
 * side, that a revision in progress has not touched what the public reads.
 */
export const VersionPanels = ({ item, latestVersion }: VersionPanelsProps) => {
  const live = item.publishedVersion;
  // Only a *different* version than the live one is a draft in progress —
  // otherwise `currentDraft` and `publishedVersion` are the same row.
  const draft =
    latestVersion && latestVersion.id !== item.publishedVersionId
      ? latestVersion
      : null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Live version</CardTitle>
          <CardDescription>What the public reads right now.</CardDescription>
        </CardHeader>
        <CardContent>
          {live ? (
            <VersionSummary itemId={item.id} version={live} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing is published yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Draft in progress</CardTitle>
          <CardDescription>
            Invisible to the public until it&apos;s published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {draft ? (
            <VersionSummary itemId={item.id} version={draft} />
          ) : (
            <p className="text-sm text-muted-foreground">
              {live
                ? "No revision in progress."
                : "No draft — start one to get going."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
