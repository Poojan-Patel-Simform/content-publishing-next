"use client";

import { use } from "react";
import { ItemDetailContainer } from "@/features/items/components/ItemDetail.container";

const ItemDetailPage = ({ params }: PageProps<"/items/[id]">) => {
  const { id } = use(params);
  return <ItemDetailContainer id={id} />;
};

export default ItemDetailPage;
