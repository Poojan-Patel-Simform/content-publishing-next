"use client";

import { useRouter } from "next/navigation";
import { toUpdateInput, type ContentFormValues } from "@/features/items/schema";
import { useItem, useItemVersion, useUpdateVersion } from "@/features/items/hooks";

/**
 * Owns the two queries and the update mutation the edit page needs. Which
 * version is being edited is derived here (`currentDraft`), and whether that
 * draft is actually editable is left to the caller, which knows the state
 * machine's rules.
 */
export const useItemEdit = (id: string) => {
  const router = useRouter();

  const itemQuery = useItem(id);
  // `currentDraft` is the item's newest version whatever its status; whether
  // it is actually editable is decided by the state machine.
  const versionId = itemQuery.data?.item.currentDraft?.id ?? "";
  const versionQuery = useItemVersion(id, versionId);
  const updateVersion = useUpdateVersion(id);

  const onSubmit = async (values: ContentFormValues) => {
    const summary = itemQuery.data?.item.currentDraft;
    if (!summary) return;
    await updateVersion.mutateAsync({
      versionId: summary.id,
      input: toUpdateInput(values),
    });
    router.push(`/items/${id}`);
  };

  return { itemQuery, versionId, versionQuery, onSubmit };
};
