import type { ContentListParams } from "@/lib/api/content";
import type { ItemListParams } from "@/lib/api/items";
import type { QueueParams } from "@/lib/api/editorial";

export const authKeys = {
  me: ["auth", "me"] as const,
};

/**
 * Hierarchical factories: each key is a prefix of the ones below it, so a
 * mutation can invalidate coarsely (`itemKeys.all`) without enumerating every
 * filter combination a list might be cached under.
 */
export const contentKeys = {
  all: ["content"] as const,
  list: (params: ContentListParams = {}) => ["content", "list", params] as const,
  detail: (slug: string) => ["content", "detail", slug] as const,
};

export const itemKeys = {
  all: ["items"] as const,
  list: (params: ItemListParams = {}) => ["items", "list", params] as const,
  detail: (id: string) => ["items", "detail", id] as const,
  versions: (id: string) => ["items", "detail", id, "versions"] as const,
  version: (id: string, versionId: string) =>
    ["items", "detail", id, "versions", versionId] as const,
  audit: (id: string) => ["items", "detail", id, "audit"] as const,
};

export const editorialKeys = {
  all: ["editorial"] as const,
  queue: (params: QueueParams = {}) => ["editorial", "queue", params] as const,
};
