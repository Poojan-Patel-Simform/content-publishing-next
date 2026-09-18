"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import type { ContentVersionDto } from "@/lib/api/content-types";
import { CHANGE_SUMMARY_MAX_LENGTH } from "@/features/items/schema";
import { useRestoreVersion } from "@/features/editorial/hooks";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Editor-only. Restoring branches the old version into a brand-new `DRAFT`
 * rather than rewriting history — so it changes nothing publicly, and the copy
 * has to say so before the click, not after.
 */
interface RestoreVersionButtonProps {
  itemId: string;
  version: ContentVersionDto;
}

export const RestoreVersionButton = ({
  itemId,
  version,
}: RestoreVersionButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");

  const restore = useRestoreVersion(itemId);

  const close = () => {
    setOpen(false);
    restore.reset();
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <History />
        Restore this version
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
        title={`Restore version ${version.versionNumber}?`}
        description="This copies it into a new draft. It does not go live: the draft still has to be submitted, reviewed and published like any other, and whatever is published now stays published."
        confirmLabel="Restore as a new draft"
        isPending={restore.isPending}
        error={restore.error}
        onConfirm={async () => {
          try {
            const { version: created } = await restore.mutateAsync({
              versionId: version.id,
              ...(changeSummary.trim()
                ? { changeSummary: changeSummary.trim() }
                : {}),
            });
            setChangeSummary("");
            close();
            router.push(`/items/${itemId}/versions/${created.id}`);
          } catch {
            // Surfaced in the dialog by `error` above.
          }
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="restore-summary">Change summary (optional)</Label>
          <Input
            id="restore-summary"
            value={changeSummary}
            maxLength={CHANGE_SUMMARY_MAX_LENGTH}
            placeholder={`Restored from version ${version.versionNumber}`}
            onChange={(event) => setChangeSummary(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Defaults to &quot;Restored from version {version.versionNumber}&quot;.
          </p>
        </div>
      </ConfirmDialog>
    </>
  );
};
