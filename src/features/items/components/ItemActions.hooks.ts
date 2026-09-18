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
 */
export const useItemActions = (
  item: ItemDetailDto,
  latestVersion: ContentVersionSummaryDto | null
) => {
  const router = useRouter();
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [revisionSummary, setRevisionSummary] = useState("");

  const submit = useSubmitForReview(item.id);
  const revise = useCreateRevision(item.id);
  const archive = useArchiveItem(item.id);

  const isArchived = item.status === "ARCHIVED";
  const canEdit =
    !isArchived && !!latestVersion && isEditableVersion(latestVersion.status);
  // "Open" = still moving through the workflow and not the live version, i.e.
  // there is already an edit in flight that a revision would collide with.
  const hasOpenVersion =
    !!latestVersion &&
    latestVersion.id !== item.publishedVersionId &&
    isOpenVersion(latestVersion.status);
  const canRevise = !isArchived && !!item.publishedVersionId && !hasOpenVersion;

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
