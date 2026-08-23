"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cancelByToken } from "@/app/track/[token]/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function CancelRequestButton({ token }: { token: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    await cancelByToken(token, reason);
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Cancel this request</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this request?</DialogTitle>
          <DialogDescription>
            Volunteers who haven&apos;t collected yet will be notified this request is no longer available.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Keep request</Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Cancel request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
