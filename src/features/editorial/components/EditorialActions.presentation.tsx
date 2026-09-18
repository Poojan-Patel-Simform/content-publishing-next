import {
  CalendarClock,
  CalendarX,
  CheckCircle2,
  EyeOff,
  Rocket,
  XCircle,
} from "lucide-react";
import {
  EditorialActionDialogs,
  type EditorialActionsState,
} from "@/features/editorial/components/EditorialActionDialogs";
import { Button } from "@/components/ui/button";

export interface EditorialActionsPresentationProps {
  state: EditorialActionsState;
  itemId: string;
  scheduledFor?: string | null;
}

/**
 * The editor-side half of the item action bar, gated on the api.md state
 * machine. It sits next to `ItemActions` rather than inside it: an editor
 * looking at their own item gets both, and the author actions stay readable
 * without a role branch threaded through them.
 */
export const EditorialActionsPresentation = ({
  state,
  itemId,
  scheduledFor,
}: EditorialActionsPresentationProps) => {
  const { isPendingReview, canPublish, isScheduled, canUnpublish, setDialog, openSchedule } =
    state;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isPendingReview && (
        <>
          <Button size="sm" onClick={() => setDialog("approve")}>
            <CheckCircle2 />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => setDialog("reject")}
          >
            <XCircle />
            Reject
          </Button>
        </>
      )}

      {canPublish && (
        <>
          <Button variant="outline" size="sm" onClick={() => setDialog("publish")}>
            <Rocket />
            Publish now
          </Button>
          <Button variant="outline" size="sm" onClick={openSchedule}>
            <CalendarClock />
            Schedule
          </Button>
        </>
      )}

      {isScheduled && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialog("cancelSchedule")}
        >
          <CalendarX />
          Cancel schedule
        </Button>
      )}

      {canUnpublish && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => setDialog("unpublish")}
        >
          <EyeOff />
          Unpublish
        </Button>
      )}

      <EditorialActionDialogs state={state} scheduledFor={scheduledFor} itemId={itemId} />
    </div>
  );
};
