"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Ban } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

export function AdminCancelButton({ rescueId }: { rescueId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("cancel_rescue", { p_rescue_id: rescueId, p_reason: reason });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    toast.success("Rescue cancelled");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive" onClick={(e) => e.stopPropagation()}>
          <Ban /> Cancel
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Cancel this rescue?</DialogTitle>
          <DialogDescription>This removes it from active feeds. Choose a reason for the record.</DialogDescription>
        </DialogHeader>
        <Textarea placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Keep rescue</Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Cancel rescue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
