import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type {
  AuditEvent,
  ContentItemDto,
  ContentVersionDto,
  ContentVersionSummaryDto,
  ItemDetailDto,
  ItemStatus,
  Paginated,
  VersionStatus,
} from "@/lib/api/content-types";

export interface ItemListParams {
  page?: number;
  pageSize?: number;
  /** Editor-only filter; redundant for an author, who is already self-scoped. */
  authorId?: string;
  status?: ItemStatus;
  /**
   * Filters on the item's versions rather than the item. The only way to ask
   * for "rejected": that state lives on the version, and the item carrying it
   * still reports `status: "DRAFT"`.
   */
  versionStatus?: VersionStatus;
}

export interface CreateItemInput {
  title: string;
  body: string;
  excerpt?: string | null;
  categorySlug?: string;
  tagSlugs?: string[];
  changeSummary: string;
}

export interface UpdateVersionInput {
  title?: string;
  body?: string;
  excerpt?: string | null;
  /** `null` clears the category. */
  categorySlug?: string | null;
  tagSlugs?: string[];
  changeSummary: string;
}

/**
 * Authoring surface. Every id-scoped call returns `404 NOT_FOUND` — never
 * `403` — when the id falls outside the caller's scope, so a missing item and
 * someone else's item are indistinguishable by design.
 */
export const itemsApi = {
  create: (input: CreateItemInput) =>
    apiPost<{ item: ContentItemDto; version: ContentVersionSummaryDto }>(
      "/items",
      input
    ),

  list: (params: ItemListParams = {}) =>
    apiGet<Paginated<ContentItemDto>>("/items", { params }),

  get: (id: string) => apiGet<{ item: ItemDetailDto }>(`/items/${id}`),

  updateVersion: (id: string, versionId: string, input: UpdateVersionInput) =>
    apiPatch<{ version: ContentVersionDto }>(
      `/items/${id}/versions/${versionId}`,
      input
    ),

  submit: (id: string) =>
    apiPost<{ version: ContentVersionDto }>(`/items/${id}/submit`),

  createRevision: (id: string, input: { changeSummary?: string } = {}) =>
    apiPost<{ version: ContentVersionDto }>(`/items/${id}/revisions`, input),

  listVersions: (id: string) =>
    apiGet<{ versions: ContentVersionSummaryDto[] }>(`/items/${id}/versions`),

  getVersion: (id: string, versionId: string) =>
    apiGet<{ version: ContentVersionDto }>(`/items/${id}/versions/${versionId}`),

  audit: (id: string) => apiGet<{ events: AuditEvent[] }>(`/items/${id}/audit`),

  /** Soft-delete (`status -> ARCHIVED`). `204 No Content`. */
  archive: (id: string) => apiDelete<void>(`/items/${id}`),
};
