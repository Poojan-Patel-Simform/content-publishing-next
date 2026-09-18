"use client";

import { use } from "react";
import { ItemEditContainer } from "@/features/items/components/ItemEdit.container";

const EditVersionPage = ({ params }: PageProps<"/items/[id]/edit">) => {
  const { id } = use(params);
  return <ItemEditContainer id={id} />;
};

export default EditVersionPage;
