"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { editorialApi, type QueueParams } from "@/lib/api/editorial";
import { contentKeys, editorialKeys, itemKeys } from "@/lib/query-keys";

/**
 * Every editorial action moves a version through the state machine, which the
 * item detail page, the version history, the audit trail, the dashboard *and*
 * the queue all read. `itemKeys.all` and `editorialKeys.all` are prefixes of
 * the lot, so two coarse invalidations cover it — same reasoning as
 * `use-item-mutations.ts`.
 */
const invalidateEditorial = (queryClient: QueryClient) => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: itemKeys.all }),
    queryClient.invalidateQueries({ queryKey: editorialKeys.all }),
  ]);
};

/** The pending-review queue, oldest submission first (the API orders it). */
export const useReviewQueue = (params: QueueParams) => {
  return useQuery({
    queryKey: editorialKeys.queue(params),
    queryFn: () => editorialApi.queue(params),
    placeholderData: keepPreviousData,
  });
};

/** Every author, for the "Authors' content" author filter. Rarely changes,
 * so no `placeholderData` juggling is needed. */
export const useAuthors = () => {
  return useQuery({
    queryKey: editorialKeys.authors(),
    queryFn: () => editorialApi.listAuthors(),
  });
};

export const useApproveVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      comment,
    }: {
      versionId: string;
      comment?: string;
    }) => editorialApi.approve(versionId, comment ? { comment } : {}),
    onSuccess: () => invalidateEditorial(queryClient),
  });
};

/** `comment` is required by the API here, unlike every other decision. */
export const useRejectVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ versionId, comment }: { versionId: string; comment: string }) =>
      editorialApi.reject(versionId, { comment }),
    onSuccess: () => invalidateEditorial(queryClient),
  });
};

export const usePublishVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      comment,
    }: {
      versionId: string;
      comment?: string;
    }) => editorialApi.publish(versionId, comment ? { comment } : {}),
    onSuccess: async () => {
      await invalidateEditorial(queryClient);
      // The item just became (or stopped being) publicly readable.
      await queryClient.invalidateQueries({ queryKey: contentKeys.all });
    },
  });
};

export const useScheduleVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      scheduledFor,
    }: {
      versionId: string;
      scheduledFor: string;
    }) => editorialApi.schedule(versionId, { scheduledFor }),
    onSuccess: () => invalidateEditorial(queryClient),
  });
};

export const useCancelSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: string) => editorialApi.cancelSchedule(versionId),
    onSuccess: () => invalidateEditorial(queryClient),
  });
};

export const useUnpublishItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => editorialApi.unpublish(itemId),
    onSuccess: async () => {
      await invalidateEditorial(queryClient);
      await queryClient.invalidateQueries({ queryKey: contentKeys.all });
    },
  });
};

/** Branches an old version into a new `DRAFT` — it does not go live. */
export const useRestoreVersion = (itemId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      changeSummary,
    }: {
      versionId: string;
      changeSummary?: string;
    }) =>
      editorialApi.restore(
        itemId,
        versionId,
        changeSummary ? { changeSummary } : {}
      ),
    onSuccess: () => invalidateEditorial(queryClient),
  });
};
