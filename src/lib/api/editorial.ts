import { apiDelete, apiGet, apiPost } from "@/lib/api/client";
import type {
  ContentVersionSummaryDto,
  Paginated,
  ReviewQueueEntry,
} from "@/lib/api/content-types";

export interface QueueParams {
  page?: number;
  pageSize?: number;
}

/** Editor-only surface (`requireEditor`). Every illegal state transition comes
 * back as `409 CONFLICT` rather than a silent no-op. */
export const editorialApi = {
  /** Versions in `PENDING_REVIEW`, oldest `submittedAt` first. Rows carry
   * `contentItemId` and `author` on top of the plain version summary. */
  queue: (params: QueueParams = {}) =>
    apiGet<Paginated<ReviewQueueEntry>>("/editorial/queue", { params }),

  approve: (versionId: string, input: { comment?: string } = {}) =>
    apiPost<{ version: ContentVersionSummaryDto }>(
      `/editorial/versions/${versionId}/approve`,
      input
    ),

  /** `comment` is required by the API, 1-2000 chars. */
  reject: (versionId: string, input: { comment: string }) =>
    apiPost<{ version: ContentVersionSummaryDto }>(
      `/editorial/versions/${versionId}/reject`,
      input
    ),

  publish: (versionId: string, input: { comment?: string } = {}) =>
    apiPost<{ version: ContentVersionSummaryDto }>(
      `/editorial/versions/${versionId}/publish`,
      input
    ),

  /** `scheduledFor` is a full ISO 8601 string with offset, at least
   * `SCHEDULE_MIN_LEAD_MS` (default 30s) in the future. */
  schedule: (versionId: string, input: { scheduledFor: string }) =>
    apiPost<{ version: ContentVersionSummaryDto }>(
      `/editorial/versions/${versionId}/schedule`,
      input
    ),

  /** `204 No Content`. Returns the version to `APPROVED`. */
  cancelSchedule: (versionId: string) =>
    apiDelete<void>(`/editorial/versions/${versionId}/schedule`),

  /** `204 No Content`. Item stays; only the public pointer is nulled. */
  unpublish: (itemId: string) =>
    apiPost<void>(`/editorial/items/${itemId}/unpublish`),

  /** Branches an old version into a new `DRAFT` — it does not go live. */
  restore: (
    itemId: string,
    versionId: string,
    input: { changeSummary?: string } = {}
  ) =>
    apiPost<{ version: ContentVersionSummaryDto }>(
      `/editorial/items/${itemId}/restore/${versionId}`,
      input
    ),
};
