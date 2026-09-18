import { apiGet } from "@/lib/api/client";
import type {
  Paginated,
  PublicItemDetail,
  PublicItemSummary,
} from "@/lib/api/content-types";

export interface ContentListParams {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  tagSlug?: string;
  /** Title prefix match, 1-200 chars. */
  q?: string;
  sort?: "newest" | "oldest";
}

/** Public reading surface — no auth, published items only. */
export const contentApi = {
  list: (params: ContentListParams = {}) =>
    apiGet<Paginated<PublicItemSummary>>("/content", { params }),

  getBySlug: (slug: string) =>
    apiGet<{ item: PublicItemDetail }>(`/content/${encodeURIComponent(slug)}`),
};
