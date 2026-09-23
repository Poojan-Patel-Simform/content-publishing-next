"use client";

import type {
  ContentVersionSummaryDto,
  ItemDetailDto,
} from "@/lib/api/content-types";
import { useItemActions } from "@/features/items/components/ItemActions.hooks";
import { ItemActionsPresentation } from "@/features/items/components/ItemActions.presentation";

interface ItemActionsProps {
  item: ItemDetailDto;
  latestVersion: ContentVersionSummaryDto | null;
  /** Only the author gets the edit/resubmit path — see `useItemActions`. */
  isOwnItem: boolean;
}

export const ItemActions = ({
  item,
  latestVersion,
  isOwnItem,
}: ItemActionsProps) => {
  const state = useItemActions(item, latestVersion, isOwnItem);

  return <ItemActionsPresentation itemId={item.id} state={state} />;
};
