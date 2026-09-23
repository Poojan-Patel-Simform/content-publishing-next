import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ContentVersionDto, ItemDetailDto } from "@/lib/api/content-types";
import type { ContentFormValues } from "@/features/items/schema";
import { ContentForm } from "@/features/items/components/content-form";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/features/items/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const ItemEditSkeleton = () => {
  return (
    <div className="space-y-5" aria-hidden>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
};

export const ItemEditNotYours = () => {
  return (
    <EmptyState
      title="Item not found, or not yours"
      description="It may have been archived, or it belongs to another author."
      action={
        <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
          Back to my content
        </Button>
      }
    />
  );
};

export interface ItemEditNotYourItemProps {
  id: string;
}

/**
 * The editor-only case: the item loads fine (editors aren't scoped by
 * `authorId`), it just isn't theirs to edit. Distinct from `ItemEditNotYours`,
 * which is the 404 an author gets for an id outside their scope — here the
 * viewer can still see the item, so the way out leads back to it.
 */
export const ItemEditNotYourItem = ({ id }: ItemEditNotYourItemProps) => {
  return (
    <EmptyState
      title="This draft belongs to its author"
      description="Only the author can edit a version and submit it for review. You can still review, publish or archive it from the item page."
      action={
        <Button variant="outline" size="sm" render={<Link href={`/items/${id}`} />}>
          Back to the item
        </Button>
      }
    />
  );
};

export interface ItemEditNothingToEditProps {
  id: string;
  description: string;
}

export const ItemEditNothingToEdit = ({ id, description }: ItemEditNothingToEditProps) => {
  return (
    <EmptyState
      title="There's nothing to edit here"
      description={description}
      action={
        <Button variant="outline" size="sm" render={<Link href={`/items/${id}`} />}>
          Back to the item
        </Button>
      }
    />
  );
};

export interface ItemEditPresentationProps {
  id: string;
  item: ItemDetailDto;
  version: ContentVersionDto;
  onSubmit: (values: ContentFormValues) => Promise<void>;
}

export const ItemEditPresentation = ({
  id,
  item,
  version,
  onSubmit,
}: ItemEditPresentationProps) => {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" render={<Link href={`/items/${id}`} />}>
        <ArrowLeft />
        Back to the item
      </Button>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Edit version {version.versionNumber}
          </h1>
          <StatusBadge status={version.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {item.publishedVersionId && item.publishedVersionId !== version.id
            ? "The published page keeps serving the live version until this one is published."
            : "Nothing here is public until an editor publishes it."}
        </p>
      </header>

      <ContentForm
        key={version.id}
        defaultValues={{
          title: version.title,
          body: version.body,
          excerpt: version.excerpt ?? "",
          categorySlug: version.categorySlug ?? "",
          tagSlugs: version.tagSlugs.join(", "),
        }}
        submitLabel="Save changes"
        pendingLabel="Saving..."
        onSubmit={onSubmit}
        changeSummaryHint="What changed in this pass? Reviewers read this. Required."
        taxonomyHint="Clearing either one removes it from this version."
        errorMessages={{
          CONFLICT:
            "This version is no longer editable — someone submitted, approved or published it while you were writing. Your text is still here; copy anything you need before leaving.",
        }}
        errorAction={
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            render={<Link href={`/items/${id}`} />}
          >
            Back to the item
          </Button>
        }
        secondaryAction={
          <Button variant="ghost" render={<Link href={`/items/${id}`} />}>
            Cancel
          </Button>
        }
      />
    </div>
  );
};
