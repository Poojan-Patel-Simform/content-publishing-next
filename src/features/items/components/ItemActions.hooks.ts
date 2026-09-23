"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ContentVersionSummaryDto,
  ItemDetailDto,
} from "@/lib/api/content-types";
import { isEditableVersion, isOpenVersion } from "@/lib/content-display";
import {
  useArchiveItem,
  useCreateRevision,
  useSubmitForReview,
} from "@/features/items/hooks";

export type OpenDialog = "submit" | "revise" | "archive" | null;

/**
 * Owns the state and mutation wiring for the author-side action bar, gated on
 * the api.md state machine. `latestVersion` is the item's newest version
 * whatever its status — the API calls it `currentDraft`, but it is only
 * *actually* a draft when it isn't the one currently published.
 *
 * Editing and resubmitting belong to the item's author alone, so they are
 * gated on `isOwnItem` on top of the state machine — an editor who rejects a
 * version is not the one who fixes it. The editor keeps the actions that are
 * genuinely theirs (archive, and the revision branch off a live version).
 *
 * A revision can also branch off an item an editor has unpublished, so the
 * author can rework pulled content and send it back through review.
 */
export const useItemActions = (
  item: ItemDetailDto,
  latestVersion: ContentVersionSummaryDto | null,
  isOwnItem: boolean
) => {
  const router = useRouter();
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [revisionSummary, setRevisionSummary] = useState("");

  const submit = useSubmitForReview(item.id);
  const revise = useCreateRevision(item.id);
  const archive = useArchiveItem(item.id);

  const isArchived = item.status === "ARCHIVED";
  const canEdit =
    isOwnItem &&
    !isArchived &&
    !!latestVersion &&
    isEditableVersion(latestVersion.status);
  // "Open" = still moving through the workflow and not the live version, i.e.
  // there is already an edit in flight that a revision would collide with.
  const hasOpenVersion =
    !!latestVersion &&
    latestVersion.id !== item.publishedVersionId &&
    isOpenVersion(latestVersion.status);
  // An unpublished item has no live pointer, but the API branches the revision
  // from its latest UNPUBLISHED version instead.
  const isUnpublished = item.status === "UNPUBLISHED";
  const canRevise =
    !isArchived &&
    (!!item.publishedVersionId || isUnpublished) &&
    !hasOpenVersion;

  const close = () => {
    setDialog(null);
    submit.reset();
    revise.reset();
    archive.reset();
  };

  const onConfirmSubmit = async () => {
    try {
      await submit.mutateAsync();
      close();
    } catch {
      // Surfaced in the dialog by `error` above.
    }
  };

  const onConfirmRevise = async () => {
    try {
      await revise.mutateAsync(
        revisionSummary.trim() ? { changeSummary: revisionSummary.trim() } : {}
      );
      setRevisionSummary("");
      close();
      router.push(`/items/${item.id}/edit`);
    } catch {
      // Surfaced in the dialog by `error` above.
    }
  };

  const onConfirmArchive = async () => {
    try {
      await archive.mutateAsync();
      close();
      router.push("/dashboard");
    } catch {
      // Surfaced in the dialog by `error` above.
    }
  };

  return {
    dialog,
    setDialog,
    close,
    revisionSummary,
    onRevisionSummaryChange: setRevisionSummary,
    isArchived,
    isUnpublished,
    canEdit,
    canRevise,
    submit,
    revise,
    archive,
    onConfirmSubmit,
    onConfirmRevise,
    onConfirmArchive,
  };
};
