import Link from "next/link";
import type { ContentItemDto } from "@/lib/api/content-types";
import { itemDisplayTitle } from "@/lib/content-display";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/features/items/components/status-badge";
import { Card } from "@/components/ui/card";

interface ItemRowProps {
  item: ContentItemDto;
  showAuthor?: boolean;
}

export const ItemRow = ({ item, showAuthor = false }: ItemRowProps) => {
  return (
    <Card size="sm" className="relative transition-colors hover:bg-accent/40">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-(--card-spacing)">
        <Link
          href={`/items/${item.id}`}
          className="font-medium after:absolute after:inset-0 hover:underline"
        >
          {itemDisplayTitle(item)}
        </Link>
        <StatusBadge status={item.status} />
        {showAuthor && (
          <span className="text-xs text-muted-foreground">
            {item.author.displayName}
          </span>
        )}
        <time
          dateTime={item.updatedAt}
          className="ml-auto text-xs text-muted-foreground"
        >
          Updated {formatDateTime(item.updatedAt)}
        </time>
      </div>
    </Card>
  );
};
