"use client";

import { useAuth } from "@/features/auth/hooks";
import {
  useItem,
  useItemAudit,
  useItemVersion,
  useItemVersions,
} from "@/features/items/hooks";

/**
 * Owns every query the item detail page needs, plus the small pieces of
 * derived state (`isOwnItem`, `isEditor`, `latestVersion`, `rejected`,
 * `scheduledFor`) the presentation layer branches on.
 */
export const useItemDetail = (id: string) => {
  const { user } = useAuth();

  const itemQuery = useItem(id);
  const versionsQuery = useItemVersions(id);
  const auditQuery = useItemAudit(id);

  // `scheduledPublishAt` lives only on the full `ContentVersionDto`; the two
  // summaries the item payload carries don't have it. Fetching it is therefore
  // conditional on the version actually being scheduled — an empty id leaves
  // the query disabled, which keeps the hook call unconditional.
  const scheduledVersionId =
    itemQuery.data?.item.currentDraft?.status === "SCHEDULED"
      ? itemQuery.data.item.currentDraft.id
      : "";
  const scheduledVersion = useItemVersion(id, scheduledVersionId);
  const scheduledFor = scheduledVersion.data?.version.scheduledPublishAt ?? null;

  const item = itemQuery.data?.item;
  const versions = versionsQuery.data?.versions ?? [];
  // `currentDraft` is the newest version whatever its status; the versions
  // list (also newest first) agrees, and is the fresher of the two while it
  // loads.
  const latestVersion = item ? versions[0] ?? item.currentDraft ?? null : null;
  const isOwnItem = item ? item.authorId === user?.id : false;
  const isEditor = user?.role === "EDITOR";
  const rejected =
    latestVersion?.status === "REJECTED" ? latestVersion : null;

  return {
    itemQuery,
    versionsQuery,
    auditQuery,
    item,
    latestVersion,
    isOwnItem,
    isEditor,
    rejected,
    scheduledFor,
  };
};
