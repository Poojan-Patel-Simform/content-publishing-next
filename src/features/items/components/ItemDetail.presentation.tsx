import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type {
  AuditEvent,
  ContentVersionSummaryDto,
  ItemDetailDto,
} from "@/lib/api/content-types";
import { describeSchedule, itemDisplayTitle } from "@/lib/content-display";
import { formatDateTime } from "@/lib/format";
import { AuditTrail } from "@/features/items/components/audit-trail";
import { EditorialActions } from "@/features/editorial/components/editorial-actions";
import { ErrorState } from "@/components/shared/error-state";
import { ItemActions } from "@/features/items/components/item-actions";
import { StatusBadge } from "@/features/items/components/status-badge";
import { VersionPanels } from "@/features/items/components/version-panels";
import { VersionTimeline } from "@/features/items/components/version-timeline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ItemDetailListSkeleton = () => {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
};

export const ItemDetailSkeleton = () => {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-9 w-72" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    </div>
  );
};

interface VersionsSectionState {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  versions: ContentVersionSummaryDto[];
  onRetry: () => void;
}

interface AuditSectionState {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  events: AuditEvent[];
  onRetry: () => void;
}

export interface ItemDetailPresentationProps {
  item: ItemDetailDto;
  latestVersion: ContentVersionSummaryDto | null;
  isOwnItem: boolean;
  isEditor: boolean;
  rejected: ContentVersionSummaryDto | null;
  scheduledFor: string | null;
  versionsSection: VersionsSectionState;
  auditSection: AuditSectionState;
}

export const ItemDetailPresentation = ({
  item,
  latestVersion,
  isOwnItem,
  isEditor,
  rejected,
  scheduledFor,
  versionsSection,
  auditSection,
}: ItemDetailPresentationProps) => {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/dashboard" />}>
        <ArrowLeft />
        My content
      </Button>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            {itemDisplayTitle(item)}
          </h1>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {isOwnItem ? "Yours" : `Author ${item.authorId}`} · updated{" "}
          <time dateTime={item.updatedAt}>{formatDateTime(item.updatedAt)}</time>
        </p>
        {item.status === "PUBLISHED" && (
          <Button variant="outline" size="sm" render={<Link href={`/content/${item.slug}`} />}>
            <ExternalLink />
            View public page
          </Button>
        )}
      </header>

      {rejected && (
        <Alert variant="destructive">
          <AlertTitle>
            {isOwnItem
              ? "An editor sent this back for changes"
              : "This version was sent back for changes"}
          </AlertTitle>
          <AlertDescription>
            {/* The reject comment is stored server-side on the `Review` row but
                no endpoint reads it back, so it can't be shown here yet. */}
            {isOwnItem
              ? `Version ${rejected.versionNumber} was rejected. Edit the draft and submit it again when it's ready.`
              : `Version ${rejected.versionNumber} was rejected. It's with its author now — it comes back to the queue once they resubmit it.`}
          </AlertDescription>
        </Alert>
      )}

      {latestVersion?.status === "SCHEDULED" && (
        <Alert>
          <AlertTitle>This version is queued to publish</AlertTitle>
          <AlertDescription>
            {scheduledFor
              ? describeSchedule(scheduledFor)
              : "Scheduled — loading the exact time..."}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <ItemActions
          item={item}
          latestVersion={latestVersion ?? null}
          isOwnItem={isOwnItem}
        />
        {isEditor && (
          <EditorialActions
            item={item}
            latestVersion={latestVersion ?? null}
            scheduledFor={scheduledFor}
          />
        )}
      </div>

      <Separator />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <VersionPanels item={item} latestVersion={latestVersion ?? null} />
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          {versionsSection.isPending ? (
            <ItemDetailListSkeleton />
          ) : versionsSection.isError ? (
            <ErrorState
              error={versionsSection.error}
              onRetry={versionsSection.onRetry}
              title="Couldn't load the version history"
            />
          ) : (
            <VersionTimeline
              itemId={item.id}
              versions={versionsSection.versions}
              publishedVersionId={item.publishedVersionId}
            />
          )}
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          {auditSection.isPending ? (
            <ItemDetailListSkeleton />
          ) : auditSection.isError ? (
            <ErrorState
              error={auditSection.error}
              onRetry={auditSection.onRetry}
              title="Couldn't load the activity trail"
            />
          ) : (
            <AuditTrail events={auditSection.events} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
