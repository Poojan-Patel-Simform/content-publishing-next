import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { PublicItemDetail } from "@/lib/api/content-types";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ArticleBodyProps {
  body: string;
}

/**
 * The body is stored and served as plain text, so it is rendered as text —
 * paragraph per blank line, no HTML injection surface.
 */
const ArticleBody = ({ body }: ArticleBodyProps) => {
  const paragraphs = body.split(/\n{2,}/).filter((part) => part.trim().length > 0);

  return (
    <div className="max-w-prose space-y-4 text-base leading-7">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  );
};

export const PublishedItemNotFound = () => {
  return (
    <EmptyState
      title="Page not found"
      description="There's nothing published at this address."
      action={
        <Button variant="outline" size="sm" render={<Link href="/" />}>
          Browse published content
        </Button>
      }
    />
  );
};

export const PublishedItemSkeleton = () => {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-40" />
      <div className="max-w-prose space-y-3">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-4 w-full last:w-1/2" />
        ))}
      </div>
    </div>
  );
};

export interface PublishedItemPresentationProps {
  item: PublicItemDetail;
}

export const PublishedItemPresentation = ({ item }: PublishedItemPresentationProps) => {
  return (
    <article className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        render={<Link href="/" />}
      >
        <ArrowLeft />
        All content
      </Button>

      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          {item.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Published{" "}
          <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
        </p>
        {item.excerpt && (
          <p className="max-w-prose text-base text-muted-foreground">
            {item.excerpt}
          </p>
        )}
      </header>

      <ArticleBody body={item.body} />
    </article>
  );
};
