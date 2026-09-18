"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { itemsApi, type CreateItemInput, type ItemListParams, type UpdateVersionInput } from "@/lib/api/items";
import { isApiError } from "@/lib/api/api-error";
import { contentApi, type ContentListParams } from "@/lib/api/content";
import { contentKeys, editorialKeys, itemKeys } from "@/lib/query-keys";

/**
 * The author's (or, with `scope=all`, the editor's) item list.
 * `keepPreviousData` keeps the current page visible while the next one loads,
 * matching the public feed's behaviour.
 */
export const useItems = (params: ItemListParams) => {
  return useQuery({
    queryKey: itemKeys.list(params),
    queryFn: () => itemsApi.list(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * A 404 here means "no such item, or not yours" — an answer, not a transient
 * failure — so retrying it just delays the empty state. Same for the 422 a
 * malformed uuid in the URL produces.
 */
const retryUnlessTerminal = (failureCount: number, error: unknown) => {
  if (isApiError(error) && (error.status === 404 || error.status === 422)) {
    return false;
  }
  return failureCount < 2;
};

export const useItem = (id: string) => {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: () => itemsApi.get(id),
    enabled: id.length > 0,
    retry: retryUnlessTerminal,
  });
};

/** Newest version first — the API orders it that way. */
export const useItemVersions = (id: string) => {
  return useQuery({
    queryKey: itemKeys.versions(id),
    queryFn: () => itemsApi.listVersions(id),
    enabled: id.length > 0,
    retry: retryUnlessTerminal,
  });
};

export const useItemVersion = (id: string, versionId: string) => {
  return useQuery({
    queryKey: itemKeys.version(id, versionId),
    queryFn: () => itemsApi.getVersion(id, versionId),
    enabled: id.length > 0 && versionId.length > 0,
    retry: retryUnlessTerminal,
  });
};

export const useItemAudit = (id: string) => {
  return useQuery({
    queryKey: itemKeys.audit(id),
    queryFn: () => itemsApi.audit(id),
    enabled: id.length > 0,
    retry: retryUnlessTerminal,
  });
};

/**
 * `itemKeys.all` (`["items"]`) is a prefix of every item key — lists, detail,
 * versions and audit alike — so one coarse invalidation covers the lot without
 * enumerating the filter combinations a list might be cached under.
 */
const invalidateItems = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({ queryKey: itemKeys.all });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateItemInput) => itemsApi.create(input),
    onSuccess: () => invalidateItems(queryClient),
  });
};

export const useUpdateVersion = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      input,
    }: {
      versionId: string;
      input: UpdateVersionInput;
    }) => itemsApi.updateVersion(id, versionId, input),
    onSuccess: () => invalidateItems(queryClient),
  });
};

export const useSubmitForReview = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => itemsApi.submit(id),
    onSuccess: async () => {
      // The submitted version lands in the editorial queue, which the header's
      // pending-count badge reads.
      await Promise.all([
        invalidateItems(queryClient),
        queryClient.invalidateQueries({ queryKey: editorialKeys.all }),
      ]);
    },
  });
};

export const useCreateRevision = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { changeSummary?: string } = {}) =>
      itemsApi.createRevision(id, input),
    onSuccess: () => invalidateItems(queryClient),
  });
};

export const useArchiveItem = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => itemsApi.archive(id),
    onSuccess: () => invalidateItems(queryClient),
  });
};

/**
 * The public feed. `keepPreviousData` keeps the current page on screen while
 * the next one loads, so paging doesn't flash an empty list.
 */
export const usePublishedList = (params: ContentListParams) => {
  return useQuery({
    queryKey: contentKeys.list(params),
    queryFn: () => contentApi.list(params),
    placeholderData: keepPreviousData,
  });
};

export const usePublishedItem = (slug: string) => {
  return useQuery({
    queryKey: contentKeys.detail(slug),
    queryFn: () => contentApi.getBySlug(slug),
    enabled: slug.length > 0,
  });
};
