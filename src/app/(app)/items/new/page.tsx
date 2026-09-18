"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toCreateInput, type ContentFormValues } from "@/features/items/schema";
import { useCreateItem } from "@/features/items/hooks";
import { ContentForm } from "@/features/items/components/content-form";
import { Button } from "@/components/ui/button";

const NewItemPage = () => {
  const router = useRouter();
  const createItem = useCreateItem();

  const onSubmit = async (values: ContentFormValues) => {
    // Errors are left to propagate — `ContentForm` maps a 422 onto the fields
    // and banners anything else, keeping the user's text in place.
    const { item } = await createItem.mutateAsync(toCreateInput(values));
    router.push(`/items/${item.id}`);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/dashboard" />}>
        <ArrowLeft />
        My content
      </Button>

      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          New draft
        </h1>
        <p className="text-sm text-muted-foreground">
          Saved as a draft. Nothing is public until an editor publishes it.
        </p>
      </header>

      <ContentForm
        submitLabel="Create draft"
        pendingLabel="Creating..."
        onSubmit={onSubmit}
        changeSummaryHint="A one-line note for the reviewer. Required."
        defaultValues={{ changeSummary: "Initial draft" }}
        secondaryAction={
          <Button variant="ghost" render={<Link href="/dashboard" />}>
            Cancel
          </Button>
        }
      />
    </div>
  );
};

export default NewItemPage;
