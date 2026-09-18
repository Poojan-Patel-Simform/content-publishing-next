import type { AuditEvent } from "@/lib/api/content-types";
import { auditLabel } from "@/lib/content-display";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";

interface AuditTrailProps {
  events: AuditEvent[];
}

/** The `AuditAction` trail, newest first, rendered as plain language. */
export const AuditTrail = ({ events }: AuditTrailProps) => {
  if (events.length === 0) {
    return <EmptyState title="Nothing has happened yet." />;
  }

  return (
    <ol className="space-y-3 border-l pl-4">
      {events.map((event) => (
        <li key={event.id} className="relative space-y-0.5">
          <span
            aria-hidden
            className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-muted-foreground/40"
          />
          <p className="text-sm font-medium">{auditLabel(event.action)}</p>
          <time
            dateTime={event.createdAt}
            className="block text-xs text-muted-foreground"
          >
            {formatDateTime(event.createdAt)}
          </time>
        </li>
      ))}
    </ol>
  );
};
