import type {
  AuditAction,
  ContentItemDto,
  VersionStatus,
} from "@/lib/api/content-types";
import { formatDateTime } from "@/lib/format";

/**
 * `ContentItemDto` only carries `publishedTitle`, which is null until the item
 * first goes live — so a draft's row has no title to show. The slug is derived
 * from the title at creation and then frozen, which makes it the closest thing
 * to a title the list endpoint returns.
 */
export const itemDisplayTitle = (item: ContentItemDto): string => {
  if (item.publishedTitle) return item.publishedTitle;
  return item.slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
};

/** The two statuses `PATCH .../versions/:versionId` accepts (api.md state machine). */
export const isEditableVersion = (status: VersionStatus): boolean => {
  return status === "DRAFT" || status === "REJECTED";
};

/** A version that still has somewhere to go — i.e. an edit in flight. */
export const isOpenVersion = (status: VersionStatus): boolean => {
  return (
    status === "DRAFT" ||
    status === "REJECTED" ||
    status === "PENDING_REVIEW" ||
    status === "APPROVED" ||
    status === "SCHEDULED"
  );
};

const AUDIT_LABELS: Record<AuditAction, string> = {
  ITEM_CREATED: "Item created",
  VERSION_CREATED: "New version created",
  VERSION_UPDATED: "Version edited",
  SUBMITTED_FOR_REVIEW: "Submitted for review",
  REVIEW_APPROVED: "Approved by an editor",
  REVIEW_REJECTED: "Sent back for changes",
  PUBLISHED: "Published",
  PUBLISH_SCHEDULED: "Publish scheduled",
  SCHEDULE_CANCELLED: "Schedule cancelled",
  SCHEDULED_PUBLISH_EXECUTED: "Scheduled publish ran",
  UNPUBLISHED: "Unpublished",
  REVISION_STARTED: "Revision started",
  REVISION_RESTORED: "Older version restored as a draft",
  ITEM_ARCHIVED: "Archived",
};

export const auditLabel = (action: AuditAction): string => {
  return AUDIT_LABELS[action] ?? action.replace(/_/g, " ").toLowerCase();
};

/**
 * The client-side floor for a schedule, comfortably clear of the API's
 * `SCHEDULE_MIN_LEAD_MS` (30s by default) so a slow round trip can't turn a
 * just-valid time into a 422 in flight.
 */
export const SCHEDULE_MIN_LEAD_MS = 60_000;

/**
 * An elapsed `scheduledFor` is not an error: per api.md the job keeps its
 * original time and publishes on the worker's very next tick, late and once.
 * The copy has to say that, or an editor reads an overdue row as a failure.
 */
export const describeSchedule = (scheduledFor: string, now: number = Date.now()): string => {
  const when = formatDateTime(scheduledFor);
  return new Date(scheduledFor).getTime() <= now
    ? `Publishing on the next worker tick (scheduled for ${when}, now overdue)`
    : `Scheduled for ${when}`;
};
