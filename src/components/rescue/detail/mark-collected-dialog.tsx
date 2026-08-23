"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PackageCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

export function MarkCollectedDialog({ rescueId }: { rescueId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const supabase = createClient();
    if (qty) {
      await supabase.from("rescues").update({ actual_quantity_kg: Number(qty) }).eq("id", rescueId);
    }
    const { error } = await supabase.rpc("advance_rescue_status", {
      p_rescue_id: rescueId,
      p_new_status: "collected",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    toast.success("Food collected");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <PackageCheck /> Food Collected
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm collection</DialogTitle>
          <DialogDescription>Actual quantity helps us track real impact (optional).</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Actual quantity collected (kg)</Label>
          <Input type="number" step="0.1" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Confirm collected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
