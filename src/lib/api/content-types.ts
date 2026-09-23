/**
 * Domain types for the content-publishing API, transcribed from `docs/api.md`.
 *
 * Every `Date` on the server crosses the wire as an ISO 8601 string, so each
 * timestamp is typed `string` here, not `Date`.
 */

export type ItemStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";

export type VersionStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "REJECTED"
  | "PUBLISHED"
  | "SUPERSEDED"
  | "UNPUBLISHED"
  | "DISCARDED";

/** Only the content-related actions appear on an item's trail; the auth ones
 * (`USER_LOGGED_IN`, …) share the enum server-side but never carry a
 * `contentItemId`, so they can't surface in `GET /items/:id/audit`. */
export type AuditAction =
  | "ITEM_CREATED"
  | "VERSION_CREATED"
  | "VERSION_UPDATED"
  | "SUBMITTED_FOR_REVIEW"
  | "REVIEW_APPROVED"
  | "REVIEW_REJECTED"
  | "PUBLISHED"
  | "PUBLISH_SCHEDULED"
  | "SCHEDULE_CANCELLED"
  | "SCHEDULED_PUBLISH_EXECUTED"
  | "UNPUBLISHED"
  | "REVISION_STARTED"
  | "REVISION_RESTORED"
  | "ITEM_ARCHIVED";

export interface ContentItemDto {
  id: string;
  slug: string;
  authorId: string;
  status: ItemStatus;
  publishedVersionId: string | null;
  publishedTitle: string | null;
  publishedAt: string | null;
  unpublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

/** The list-shaped version payload: no `body`, no `contentItemId`. Returned by
 * `GET /items/:id/versions`, `GET /editorial/queue`, and every editorial action. */
export interface ContentVersionSummaryDto {
  id: string;
  contentItemId: string;
  versionNumber: number;
  status: VersionStatus;
  title: string;
  changeSummary: string | null;
  createdById: string;
  createdAt: string;
  submittedAt: string | null;
  publishedAt: string | null;
}

/** A `GET /editorial/queue` row. The queue is the one place a version is read
 * without its item already in hand, so it carries the author identity an
 * editor triages on — everywhere else the caller already knows whose item it is. */
export interface ReviewQueueEntry extends ContentVersionSummaryDto {
  author: { id: string; displayName: string };
}

/** The full version, returned by `PATCH .../versions/:versionId`,
 * `POST /items/:id/submit`, `POST /items/:id/revisions` and
 * `GET /items/:id/versions/:versionId`. */
export interface ContentVersionDto {
  id: string;
  contentItemId: string;
  versionNumber: number;
  status: VersionStatus;
  title: string;
  body: string;
  excerpt: string | null;
  categoryId: string | null;
  tagIds: string[];
  /** Slug twins of the two ids above. `PATCH .../versions/:versionId` speaks
   * slugs, and no endpoint resolves an id back to one — so these are what the
   * edit form prefills from and sends back. */
  categorySlug: string | null;
  tagSlugs: string[];
  parentVersionId: string | null;
  changeSummary: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  unpublishedAt: string | null;
  scheduledPublishAt: string | null;
}

/** `GET /items/:id` — the item plus the two version pointers the detail page
 * renders as separate panels ("Live version" vs "Draft in progress"). */
export interface ItemDetailDto extends ContentItemDto {
  currentDraft: ContentVersionSummaryDto | null;
  publishedVersion: ContentVersionSummaryDto | null;
}

export interface PublicItemSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string;
}

export interface PublicItemDetail extends PublicItemSummary {
  body: string;
}

export interface AuditEvent {
  id: string;
  action: AuditAction;
  actorId: string | null;
  contentItemId: string | null;
  versionId: string | null;
  requestId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/** `GET /categories` — the fixed, backend-defined category list. */
export interface CategoryDto {
  id: string;
  slug: string;
  name: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
