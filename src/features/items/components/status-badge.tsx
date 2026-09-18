import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import type { ItemStatus, VersionStatus } from "@/lib/api/content-types";

type AnyStatus = ItemStatus | VersionStatus;

/**
 * `ItemStatus` and `VersionStatus` overlap on `DRAFT`/`PUBLISHED`/`UNPUBLISHED`
 * and mean the same thing in both, so one map covers the union.
 *
 * The base `Badge` variants don't include amber/violet/green, so the colored
 * states carry explicit classes instead of a variant.
 */
const STATUS_STYLES: Record<AnyStatus, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  PENDING_REVIEW: {
    label: "Pending review",
    className:
      "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-blue-100 text-blue-900 dark:bg-blue-500/15 dark:text-blue-200",
  },
  SCHEDULED: {
    label: "Scheduled",
    className:
      "bg-violet-100 text-violet-900 dark:bg-violet-500/15 dark:text-violet-200",
  },
  PUBLISHED: {
    label: "Published",
    className:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive",
  },
  UNPUBLISHED: {
    label: "Unpublished",
    className: "bg-muted text-muted-foreground",
  },
  SUPERSEDED: {
    label: "Superseded",
    className: "bg-muted text-muted-foreground",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-muted text-muted-foreground",
  },
  DISCARDED: {
    label: "Discarded",
    className: "bg-muted text-muted-foreground",
  },
};

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const style = STATUS_STYLES[status];

  // A status the client doesn't know about is still worth rendering verbatim
  // rather than blanking out — the API enum can grow ahead of this file.
  if (!style) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={cn(style.className, className)}>
      {style.label}
    </Badge>
  );
};

export const statusLabel = (status: AnyStatus): string => {
  return STATUS_STYLES[status]?.label ?? status;
};
