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
}

export const ItemActions = ({ item, latestVersion }: ItemActionsProps) => {
  const state = useItemActions(item, latestVersion);

  return <ItemActionsPresentation itemId={item.id} state={state} />;
};
