"use client";

import { use } from "react";
import { PublishedItemContainer } from "@/features/items/components/PublishedItem.container";

const PublishedItemPage = ({
  params,
}: PageProps<"/content/[slug]">) => {
  const { slug } = use(params);
  return <PublishedItemContainer slug={slug} />;
};

export default PublishedItemPage;
