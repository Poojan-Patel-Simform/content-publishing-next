import Link from "next/link";
import { Archive, GitBranch, Pencil, Send } from "lucide-react";
import { isApiError } from "@/lib/api/api-error";
import { CHANGE_SUMMARY_MAX_LENGTH } from "@/features/items/schema";
import type { useItemActions } from "@/features/items/components/ItemActions.hooks";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ItemActionsState = ReturnType<typeof useItemActions>;

export interface ItemActionsPresentationProps {
  itemId: string;
  state: ItemActionsState;
}

export const ItemActionsPresentation = ({
  itemId,
  state,
}: ItemActionsPresentationProps) => {
  const {
    dialog,
    setDialog,
    close,
    revisionSummary,
    onRevisionSummaryChange,
    isArchived,
    canEdit,
    canRevise,
    submit,
    revise,
    archive,
    onConfirmSubmit,
    onConfirmRevise,
    onConfirmArchive,
  } = state;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEdit && (
        <Button size="sm" render={<Link href={`/items/${itemId}/edit`} />}>
          <Pencil />
          Edit draft
        </Button>
      )}

      {canEdit && (
        <Button variant="outline" size="sm" onClick={() => setDialog("submit")}>
          <Send />
          Submit for review
        </Button>
      )}

      {canRevise && (
        <Button variant="outline" size="sm" onClick={() => setDialog("revise")}>
          <GitBranch />
          Revise published
        </Button>
      )}

      {!isArchived && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => setDialog("archive")}
        >
          <Archive />
          Archive
        </Button>
      )}

      <ConfirmDialog
        open={dialog === "submit"}
        onOpenChange={(open) => (open ? setDialog("submit") : close())}
        title="Submit for review?"
        description="An editor will review this version. You can't edit it again until they approve or send it back."
        confirmLabel="Submit"
        isPending={submit.isPending}
        error={submit.error}
        onConfirm={onConfirmSubmit}
      />

      <ConfirmDialog
        open={dialog === "revise"}
        onOpenChange={(open) => (open ? setDialog("revise") : close())}
        title="Start a revision?"
        description="This branches a new draft from the live version. The published page keeps serving the current text until the revision is reviewed and published."
        confirmLabel="Start revision"
        isPending={revise.isPending}
        error={revise.error}
        onConfirm={onConfirmRevise}
      >
        <div className="space-y-1.5">
          <Label htmlFor="revision-summary">Change summary (optional)</Label>
          <Input
            id="revision-summary"
            value={revisionSummary}
            maxLength={CHANGE_SUMMARY_MAX_LENGTH}
            placeholder="Refreshing the numbers for Q2"
            onChange={(event) => onRevisionSummaryChange(event.target.value)}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "archive"}
        onOpenChange={(open) => (open ? setDialog("archive") : close())}
        title="Archive this item?"
        description="It disappears from the active list and can't be edited. Nothing is deleted."
        confirmLabel="Archive"
        destructive
        isPending={archive.isPending}
        error={archive.error}
        // The API's 409 here says something specific and actionable ("only an
        // editor can archive a published item"); the generic CONFLICT copy
        // would throw that away.
        errorMessages={
          isApiError(archive.error) ? { CONFLICT: archive.error.message } : undefined
        }
        onConfirm={onConfirmArchive}
      />
    </div>
  );
};
