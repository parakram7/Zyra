"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, HandHeart, UserPlus, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function ClaimButton({ rescueId }: { rescueId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClaim() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("claim_rescue", { p_rescue_id: rescueId });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("You're the Rescue Lead for this call.");
    router.refresh();
  }

  return (
    <Button onClick={handleClaim} disabled={loading} size="lg" className="w-full">
      {loading ? <Loader2 className="animate-spin" /> : <HandHeart />}
      Claim Rescue
    </Button>
  );
}

export function JoinButton({ rescueId }: { rescueId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("join_rescue", { p_rescue_id: rescueId, p_role: "volunteer" });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("You joined this rescue.");
    router.refresh();
  }

  return (
    <Button onClick={handleJoin} disabled={loading} variant="outline" size="lg" className="w-full">
      {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
      Join Rescue
    </Button>
  );
}

export function LeaveButton({ rescueId }: { rescueId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLeave() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("leave_rescue", { p_rescue_id: rescueId, p_reason: reason });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    toast("You left this rescue.");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <LogOut className="size-3.5" /> Leave rescue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave this rescue?</DialogTitle>
          <DialogDescription>Let the team know why, so they can plan around it.</DialogDescription>
        </DialogHeader>
        <Textarea placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Stay on the team</Button>
          <Button variant="destructive" onClick={handleLeave} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Leave rescue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
